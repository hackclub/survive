class Admin::ReviewsController < ApplicationController
  PHASES = %w[processing review under_review second_pass reviewed withdrawn reverted].freeze
  SPECIAL = %w[stuck ingest_failed awaiting_ingest].freeze

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
    else Review.in_phase(filter)
    end
  end

  def tabs
    counts = Review.group(:ari_phase).count

    [
      { key: "all", label: "All", count: Review.count },
      { key: "awaiting_ingest", label: "Not sent", count: Review.awaiting_ingest.count },
      { key: "ingest_failed", label: "Send failed", count: Review.ingest_failed.count },
      { key: "stuck", label: "Stuck", count: Review.stuck.count },
      *PHASES.map { |phase| { key: phase, label: phase.humanize, count: counts[phase].to_i } }
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
      stuck: review.ingested_at.present? && review.ingested_at < Review::STUCK_AFTER.ago && !review.decided?
    }
  end
end
