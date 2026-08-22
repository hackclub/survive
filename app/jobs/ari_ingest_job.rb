class AriIngestJob < ApplicationJob
  queue_as :default

  retry_on Faraday::Error, wait: :polynomially_longer, attempts: 5
  retry_on Ari::Unavailable, wait: :polynomially_longer, attempts: 5

  def perform(review_id)
    review = Review.find_by(id: review_id)
    return if review.nil?

    unless Ari::Config.ingest_configured?
      Rails.logger.warn("[Ari] ingest skipped for review ##{review.id}, ARI_PROGRAM_ID or ARI_INGEST_SECRET is not set")
      return
    end

    result = Ari::Client.new.ingest(review)
    raise Ari::Unavailable, result.message if result.retryable?

    record(review, result)
  rescue Ari::IncompletePayload, Ari::NotConfigured => e
    review&.update_columns(ingest_error: e.message, updated_at: Time.current)
    Rails.logger.error("[Ari] ingest refused for review ##{review_id}: #{e.message}")
  end

  private

  def record(review, result)
    if result.accepted?
      review.update!(
        ingested_at: Time.current,
        ari_ship_id: result.ship_id.presence || review.ari_ship_id,
        ari_phase: review.ari_phase.presence || "processing",
        ingest_error: nil
      )
      Rails.logger.info("[Ari] ingested review ##{review.id} as #{review.ari_ship_id || 'pending id'}")
    else
      review.update!(ingest_error: "#{result.status}: #{result.message}")
      Rails.logger.error("[Ari] ingest #{result.status} for review ##{review.id}: #{result.message}")
    end
  end
end
