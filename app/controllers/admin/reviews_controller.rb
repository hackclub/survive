class Admin::ReviewsController < ApplicationController
  PHASES = %w[processing review under_review second_pass reviewed withdrawn reverted].freeze
  SPECIAL = %w[stuck ingest_failed awaiting_ingest in_ari decided].freeze
  OPEN_PHASES = %w[processing review under_review second_pass].freeze

  def index
    authorize :review

    pagy, reviews = pagy(filtered.includes(project: :user).order(created_at: :desc))

    render inertia: "Admin/Reviews/Index", props: {
      reviews: reviews.map { |review| serialize(review) },
      tabs: tabs,
      filter: filter,
      pagination: { page: pagy.page, pages: pagy.pages, count: pagy.count }
    }
  end

  def ingest
    review = Review.find(params[:id])
    authorize review, :withdraw?

    if review.ingested?
      return redirect_to(admin_reviews_path, alert: "#{review.project.name} is already with Ari.")
    end

    review.update!(ingest_error: nil)
    AriIngestJob.perform_later(review.id)
    audit!("review.ingest_retried", target: review, metadata: { project: review.project.name })
    redirect_to admin_reviews_path, notice: "Sending #{review.project.name} to Ari."
  end

  def withdraw
    review = Review.find(params[:id])
    authorize review

    reason = params[:reason].to_s.strip
    return redirect_to(admin_reviews_path, alert: "A reason is required to withdraw.") if reason.blank?
    return redirect_to(admin_reviews_path, alert: "#{review.project.name} can no longer be withdrawn.") unless review.withdrawable?

    result = Ari::Client.new.withdraw(review.project)

    if result.status.in?(%i[withdrawn not_queued])
      review.withdraw!(reason)
      audit!("review.withdrawn", target: review, metadata: { reason: reason, ari: result.status.to_s })
      redirect_to admin_reviews_path, notice: "Withdrew #{review.project.name} from Ari."
    else
      redirect_to admin_reviews_path, alert: "Ari refused the withdrawal: #{result.message}"
    end
  rescue Ari::NotConfigured => e
    redirect_to admin_reviews_path, alert: e.message
  end

  private

  def filter
    requested = params[:filter].to_s
    requested.in?(PHASES) || requested.in?(SPECIAL) ? requested : "all"
  end

  def filtered
    case filter
    when "all" then Review.all
    when "stuck" then Review.stuck
    when "ingest_failed" then Review.ingest_failed
    when "awaiting_ingest" then Review.awaiting_ingest
    when "in_ari" then Review.where(ari_phase: OPEN_PHASES)
    when "decided" then Review.where.not(decided_at: nil)
    else Review.in_phase(filter)
    end
  end

  def tabs
    [
      { key: "all", label: "All", count: Review.count },
      { key: "in_ari", label: "In Ari", count: Review.where(ari_phase: OPEN_PHASES).count },
      { key: "stuck", label: "Stuck", count: Review.stuck.count },
      { key: "awaiting_ingest", label: "Not sent", count: Review.awaiting_ingest.count },
      { key: "ingest_failed", label: "Failed", count: Review.ingest_failed.count },
      { key: "decided", label: "Decided", count: Review.where.not(decided_at: nil).count }
    ]
  end

  def serialize(review)
    project = review.project

    {
      id: review.id,
      projectId: project.id,
      projectName: project.name,
      makerName: project.user.display_name,
      round: review.round,
      state: review.state,
      ariShipId: review.ari_ship_id,
      ariPhase: review.ari_phase,
      ariDecision: review.ari_decision,
      approvedMinutes: review.approved_minutes,
      ingestVersion: review.ingest_version,
      ingestedAt: review.ingested_at&.strftime("%b %d, %H:%M"),
      ingestError: review.ingest_error,
      canWithdraw: review.withdrawable? && policy(review).withdraw?,
      stuck: review.ingested_at.present? && review.ingested_at < Review::STUCK_AFTER.ago && !review.decided?
    }
  end
end
