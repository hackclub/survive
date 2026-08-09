class Admin::ReviewController < ApplicationController
  def index
    authorize :review

    scope = Project.reviewable.unclaimed_or_claimed_by(current_user)

    if params[:q].present?
      query = "%#{params[:q]}%"
      scope = scope.joins(:user).where("projects.name ILIKE :q OR users.display_name ILIKE :q", q: query)
    end

    pagy, projects = pagy(scope.includes(:user, :hackatime_projects, banner_attachment: :blob).order(:updated_at))

    seconds_by_owner = projects.map(&:user).uniq.index_with { |owner| HackatimeSyncService.call(owner) }

    render inertia: "Admin/Review/Index", props: {
      projects: projects.map { |project|
        seconds_by_name = seconds_by_owner[project.user] || {}
        linked_seconds = project.hackatime_projects.sum { |hp| seconds_by_name[hp.name].to_i }

        {
          id: project.id,
          name: project.name,
          ownerName: project.user.review_display_name,
          repoLink: project.repo_link,
          demoLink: project.demo_link,
          bannerUrl: project.banner_url,
          submittedAt: project.updated_at.strftime("%b %d, %Y"),
          claimedByYou: project.claimed_by?(current_user),
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
    project = Project.find(params[:id])
    authorize project, :review?

    claimed_project = Project.atomic_claim!(project.id, current_user)
    if claimed_project.nil?
      redirect_to admin_review_path, alert: "#{project.name} is already being reviewed by someone else."
      return
    end

    owner = claimed_project.user
    seconds_by_name = HackatimeSyncService.call(owner)

    render inertia: "Admin/Review/Show", props: {
      project: claimed_project.as_client_json,
      hackatimeProjects: owner.hackatime_projects.where(project_id: claimed_project.id).order(:name).map { |hackatime_project|
        {
          id: hackatime_project.id,
          name: hackatime_project.name,
          seconds: seconds_by_name[hackatime_project.name].to_i
        }
      },
      history: claimed_project.project_events.map(&:as_client_json),
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
    project = Project.find(params[:id])
    authorize project, :review?

    project.unclaim!(current_user) if project.claimed_by?(current_user)

    skip_ids = params[:skip].to_s.split(",").map(&:to_i) + [ project.id ]
    claim_next_or_redirect_to_queue(skip_ids)
  end

  def approve
    project = Project.find(params[:id])
    authorize project, :review?
    return if blocked_by_claim?(project)

    project.approve!(current_user, feedback: params[:feedback])
    redirect_to admin_review_path, notice: "Approved #{project.name}."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_review_project_path(project), alert: e.record.errors.full_messages.to_sentence
  end

  def reject
    project = Project.find(params[:id])
    authorize project, :review?
    return if blocked_by_claim?(project)

    project.reject!(current_user, feedback: params[:feedback])
    redirect_to admin_review_path, notice: "Rejected #{project.name}."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_review_project_path(project), alert: e.record.errors.full_messages.to_sentence
  end

  def unclaim
    project = Project.find(params[:id])
    authorize project, :review?

    if project.claimed_by?(current_user)
      project.unclaim!(current_user)
      redirect_to admin_review_path, notice: "Unclaimed #{project.name}."
    else
      redirect_to admin_review_path, alert: "You don't hold the claim on #{project.name}."
    end
  end

  private

  def claim_next_or_redirect_to_queue(skip_ids)
    loop do
      candidate = Project.reviewable
        .unclaimed_or_claimed_by(current_user)
        .where.not(id: skip_ids)
        .order(:updated_at)
        .first

      if candidate.nil?
        redirect_to admin_review_path, notice: "No more projects waiting for review."
        return
      end

      claimed = Project.atomic_claim!(candidate.id, current_user)
      if claimed
        redirect_to admin_review_project_path(claimed, skip: skip_ids.join(","))
        return
      end

      skip_ids << candidate.id
    end
  end

  def blocked_by_claim?(project)
    return false unless project.claimed_by_someone_else?(current_user)

    redirect_to admin_review_path, alert: "#{project.name} is being reviewed by someone else."
    true
  end
end
