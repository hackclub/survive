class AriStatusRefreshJob < ApplicationJob
  queue_as :default

  STALE_AFTER = 48.hours
  DECIDED_PHASES = %w[reviewed withdrawn].freeze

  def perform
    return unless Ari::Config.ingest_configured?

    client = Ari::Client.new
    Review.awaiting_ari.find_each { |review| refresh(client, review) }
  end

  private

  def refresh(client, review)
    status = client.status(review.project.ari_external_id)
    return warn_missing(review) unless status.found

    review.update_columns(
      ari_ship_id: status.ship_id.presence || review.ari_ship_id,
      ari_phase: status.phase.presence || review.ari_phase,
      updated_at: Time.current
    )

    warn_undelivered(review, status) if DECIDED_PHASES.include?(status.phase)
    warn_stale(review) if review.ingested_at < STALE_AFTER.ago
  rescue Faraday::Error => e
    Rails.logger.warn("[Ari] status check failed for review ##{review.id}: #{e.class}")
  end

  def warn_missing(review)
    Rails.logger.warn("[Ari] no ship found for review ##{review.id} (#{review.project.ari_external_id}) although we ingested it")
  end

  def warn_undelivered(review, status)
    Rails.logger.error(
      "[Ari] review ##{review.id} is #{status.phase} on Ari with decision #{status.decision.inspect} but survive never applied one, the webhook was missed"
    )
  end

  def warn_stale(review)
    Rails.logger.warn("[Ari] review ##{review.id} has been waiting on Ari since #{review.ingested_at.iso8601}")
  end
end
