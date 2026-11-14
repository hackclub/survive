class Admin::FinalReviewsController < ApplicationController
  STATUSES = %w[pending passed deducted banned voided].freeze

  def index
    authorize :final_review

    scope = filter == "pending" ? FinalReview.queued.unclaimed_or_claimed_by(current_user) : FinalReview.where(status: filter)
    pagy, rows = pagy(scope.includes(review: { project: :user }).order(created_at: :asc))

    render inertia: "Admin/FinalReviews/Index", props: {
      rows: rows.map { |row| serialize(row) },
      tabs: STATUSES.map { |status| { key: status, label: status.humanize, count: FinalReview.where(status: status).count } },
      filter: filter,
      pagination: { page: pagy.page, pages: pagy.pages, count: pagy.count }
    }
  end

  def show
    record = FinalReview.includes(review: { project: :user }).find(params[:id])
    authorize record

    claimed = record.pending? ? FinalReview.atomic_claim!(record.id, current_user) : record
    if claimed.nil?
      redirect_to admin_final_reviews_path, alert: "Someone else is looking at this right now."
      return
    end

    render inertia: "Admin/FinalReviews/Show", props: { record: detail(claimed) }
  end

  def decide
    record = FinalReview.find(params[:id])
    authorize record, :decide?
    return if blocked_by_claim?(record)

    case params[:decision]
    when "pass" then pass(record)
    when "deduct" then deduct(record)
    when "ban" then ban(record)
    else redirect_to admin_final_review_path(record), alert: "Pick a decision."
    end
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_final_review_path(record), alert: e.record.errors.full_messages.to_sentence
  end

  def unclaim
    record = FinalReview.find(params[:id])
    authorize record, :unclaim?

    record.unclaim!(current_user)
    redirect_to admin_final_reviews_path, notice: "Released."
  end

  private

  def pass(record)
    record.pass!(current_user, params[:note])
    notify_maker(record, "passed", "Your final Survive review for “#{record.review.project.name}” passed. #{record.net_minutes} minutes were approved and your wood payout has been issued.")
    audit!("final_review.passed", target: record, metadata: base_metadata(record))
    redirect_to admin_final_reviews_path, notice: "Passed #{record.review.project.name} at #{record.net_minutes} minutes."
  end

  def deduct(record)
    record.deduct!(current_user, minutes: params[:deduction_minutes].to_i, note: params[:note].to_s)
    notify_maker(record, "deducted", "Your final Survive review for “#{record.review.project.name}” is complete. #{record.net_minutes} minutes were approved after a deduction. Check your project page for details.")
    audit!("final_review.deducted", target: record, metadata: base_metadata(record).merge(deducted: record.deduction_minutes))
    redirect_to admin_final_reviews_path, notice: "Deducted #{record.deduction_minutes} minutes from #{record.review.project.name}."
  end

  def ban(record)
    record.ban!(current_user, note: params[:note].to_s)
    notify_maker(record, "banned", "A final Survive review decision was made about your account. Please sign in to Survive and review the information on your account.")
    audit!("final_review.banned", target: record, metadata: base_metadata(record).merge(reason: record.decision_note))
    redirect_to admin_final_reviews_path, notice: "Banned #{record.review.project.user.display_name}."
  end

  def notify_maker(record, outcome, message)
    maker = record.review.project.user
    return if maker.slack_id.blank?

    SlackDmJob.perform_later(
      maker.id,
      "final-review-#{outcome}:#{record.id}:#{record.updated_at.to_i}",
      "#{message} #{SlackDmService.project_url(record.review.project)}"
    )
  end

  def base_metadata(record)
    { review_id: record.review_id, project_id: record.review.project_id, net_minutes: record.net_minutes }
  end

  def blocked_by_claim?(record)
    return false unless record.claimed_by_someone_else?(current_user)

    redirect_to admin_final_reviews_path, alert: "Someone else holds this."
    true
  end

  def filter
    params[:filter].to_s.in?(STATUSES) ? params[:filter].to_s : "pending"
  end

  def serialize(record)
    review = record.review
    project = review.project

    {
      id: record.id,
      projectId: project.id,
      projectName: project.name,
      makerName: project.user.display_name,
      round: review.round,
      status: record.status,
      approvedMinutes: review.approved_minutes,
      netMinutes: record.net_minutes,
      flags: record.flag_labels,
      claimedByYou: record.claimed_by?(current_user),
      heldByOther: record.claimed_by_someone_else?(current_user),
      waitingSince: record.created_at.strftime("%b %d, %H:%M")
    }
  end

  def detail(record)
    review = record.review
    project = review.project
    maker = project.user

    serialize(record).merge(
      repoLink: project.repo_link,
      demoLink: project.demo_link,
      ariShipId: review.ari_ship_id,
      ariAuditNote: review.reviewer_notes,
      ariNoteToMaker: review.maker_feedback,
      ariReviewer: review.ari_reviewer_email,
      minutesBreakdown: review.minutes_breakdown || {},
      signals: record.signals,
      decisionNote: record.decision_note,
      deductionMinutes: record.deduction_minutes,
      maker: {
        name: maker.display_name,
        email: maker.email,
        banned: maker.is_banned?,
        approvedProjects: maker.projects.approved.count,
        rejectedProjects: maker.projects.rejected.count,
        priorDeductions: record.signals["prior_deductions"].to_i
      }
    )
  end
end
