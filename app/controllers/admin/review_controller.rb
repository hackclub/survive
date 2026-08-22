class Admin::ReviewController < ApplicationController
  def index
    authorize :review

    scope = Review.queued.unclaimed_or_claimed_by(current_user)

    if params[:q].present?
      query = "%#{params[:q]}%"
      scope = scope.joins(project: :user).where("projects.name ILIKE :q OR users.display_name ILIKE :q", q: query)
    end

    pagy, reviews = pagy(
      scope.includes(project: [ :user, :hackatime_projects, { banner_attachment: :blob } ]).order(:created_at)
    )

    seconds_by_owner = reviews.map { |review| review.project.user }.uniq.index_with { |owner| HackatimeSyncService.call(owner) }

    render inertia: "Admin/Review/Index", props: {
      reviews: reviews.map { |review|
        project = review.project
        seconds_by_name = seconds_by_owner[project.user] || {}
        linked_seconds = project.hackatime_projects.sum { |hp| seconds_by_name[hp.name].to_i }

        {
          id: review.id,
          round: review.round,
          name: project.name,
          ownerName: project.user.review_display_name,
          repoLink: project.repo_link,
          demoLink: project.demo_link,
          bannerUrl: project.banner_url,
          submittedAt: review.created_at.strftime("%b %d, %Y"),
          claimedByYou: review.claimed_by?(current_user),
          hackatimeSeconds: linked_seconds
        }
      },
      pagination: {
        page: pagy.page,
        pages: pagy.pages,
        count: pagy.count
      },
      query: params[:q].to_s
    }
  end

  def show
    review = Review.includes(project: :user).find(params[:id])
    authorize review

    claimed = claim(review)
    if claimed.nil?
      redirect_to admin_review_path, alert: "#{review.project.name} is already being reviewed by someone else."
      return
    end

    project = claimed.project
    owner = project.user
    seconds_by_name = HackatimeSyncService.call(owner)
    claimed.seed_hour_entries!(seconds_by_name)

    render inertia: "Admin/Review/Show", props: {
      project: project.as_client_json,
      reviewId: claimed.id,
      round: claimed.round,
      claimedSeconds: claimed.claimed_seconds,
      hourEntries: claimed.hour_entries.map { |entry|
        {
          id: entry.id,
          name: entry.hackatime_name,
          claimedSeconds: entry.claimed_seconds,
          approvedMinutes: entry.approved_minutes,
          verdict: entry.verdict,
          note: entry.note
        }
      },
      hackatimeProjects: owner.hackatime_projects.where(project_id: project.id).order(:name).map { |hackatime_project|
        {
          id: hackatime_project.id,
          name: hackatime_project.name,
          seconds: seconds_by_name[hackatime_project.name].to_i
        }
      },
      history: project.project_events.map(&:as_client_json),
      submitterHistory: {
        approvedCount: owner.projects.approved.count,
        rejectedCount: owner.projects.rejected.count
      },
      skipList: params[:skip].to_s
    }
  end

  def mystats
    authorize :review, :index?

    events = ProjectEvent.where(actor: current_user).where(action: %i[approved rejected]).includes(:project).order(created_at: :desc)

    render inertia: "Admin/Review/MyStats", props: {
      totalReviews: events.count,
      approvedCount: events.approved.count,
      rejectedCount: events.rejected.count,
      todayCount: events.where(created_at: Time.zone.now.all_day).count,
      weekCount: events.where(created_at: 7.days.ago..).count,
      recent: events.limit(20).map { |event|
        {
          id: event.id,
          action: event.action,
          projectName: event.project.name,
          createdAt: event.created_at.strftime("%b %d, %Y")
        }
      }
    }
  end

  def next_project
    authorize :review, :index?

    skip_ids = params[:skip].to_s.split(",").map(&:to_i)
    claim_next_or_redirect_to_queue(skip_ids)
  end

  def skip
    review = Review.find(params[:id])
    authorize review

    review.unclaim!(current_user) if review.claimed_by?(current_user)

    skip_ids = params[:skip].to_s.split(",").map(&:to_i) + [ review.id ]
    claim_next_or_redirect_to_queue(skip_ids)
  end

  def approve
    review = Review.find(params[:id])
    authorize review
    return if blocked_by_claim?(review)

    review.approve!(current_user, feedback: params[:feedback], notes: params[:reviewer_notes], entries: entry_params)
    redirect_to admin_review_path, notice: "Approved #{review.project.name}."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_review_project_path(review), alert: e.record.errors.full_messages.to_sentence
  end

  def reject
    review = Review.find(params[:id])
    authorize review
    return if blocked_by_claim?(review)

    review.reject!(current_user, feedback: params[:feedback], notes: params[:reviewer_notes], entries: entry_params)
    redirect_to admin_review_path, notice: "Rejected #{review.project.name}."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_review_project_path(review), alert: e.record.errors.full_messages.to_sentence
  end

  def return_to_maker
    review = Review.find(params[:id])
    authorize review
    return if blocked_by_claim?(review)

    review.return_to_maker!(current_user, feedback: params[:feedback])
    redirect_to admin_review_path, notice: "Returned #{review.project.name} to the maker."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_review_project_path(review), alert: e.record.errors.full_messages.to_sentence
  end

  def unclaim
    review = Review.find(params[:id])
    authorize review

    if review.claimed_by?(current_user)
      review.unclaim!(current_user)
      redirect_to admin_review_path, notice: "Unclaimed #{review.project.name}."
    else
      redirect_to admin_review_path, alert: "You don't hold the claim on #{review.project.name}."
    end
  end

  private

  def entry_params
    return {} unless params[:entries].respond_to?(:each_pair)

    params[:entries].each_pair.with_object({}) do |(entry_id, attrs), acc|
      next unless attrs.respond_to?(:permit)

      acc[entry_id.to_i] = attrs.permit(:approved_minutes, :verdict, :note)
    end
  end

  def claim(review)
    claimed = Review.atomic_claim!(review.id, current_user)
    return nil if claimed.nil?

    claimed.in_review! if claimed.pending?
    claimed
  end

  def claim_next_or_redirect_to_queue(skip_ids)
    loop do
      candidate = Review.queued
        .unclaimed_or_claimed_by(current_user)
        .where.not(id: skip_ids)
        .order(:created_at)
        .first

      if candidate.nil?
        redirect_to admin_review_path, notice: "No more projects waiting for review."
        return
      end

      claimed = claim(candidate)
      if claimed
        redirect_to admin_review_project_path(claimed, skip: skip_ids.join(","))
        return
      end

      skip_ids << candidate.id
    end
  end

  def blocked_by_claim?(review)
    return false unless review.claimed_by_someone_else?(current_user)

    redirect_to admin_review_path, alert: "#{review.project.name} is being reviewed by someone else."
    true
  end
end
