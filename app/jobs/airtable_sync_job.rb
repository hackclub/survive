class AirtableSyncJob < ApplicationJob
  queue_as :default

  retry_on Faraday::Error, Airtable::Unavailable, wait: :polynomially_longer, attempts: 5 do |job, error|
    job.record_failure(job.arguments.first, error)
  end

  # Pushes one approved review into the YSWS Airtable table. Creates the record the first time,
  # then updates that same record on every later run, so Ari resends never duplicate it.
  def perform(review_id)
    review = Review.find_by(id: review_id)
    return if review.nil?
    return skip(review, "review is #{review.state}, only approved reviews go to Airtable") unless review.approved?

    unless Airtable::Config.configured?
      return skip(review, "Not sent: #{Airtable::Config.missing.to_sentence} not set.")
    end

    review.with_lock do
      fields = Airtable::Submission.fields(review)
      client = Airtable::Client.new
      record_id = review.airtable_record_id.present? ? client.update(review.airtable_record_id, fields) : client.create(fields)

      review.update_columns(airtable_record_id: record_id, airtable_synced_at: Time.current, airtable_error: nil,
        updated_at: Time.current)
      Rails.logger.info("[Airtable] review ##{review.id} synced as #{record_id}")
    end
  rescue Airtable::Rejected, Airtable::NotConfigured => e
    record_failure(review_id, e)
  end

  def record_failure(review_id, error)
    Review.where(id: review_id).update_all(airtable_error: "#{error.class.name.demodulize}: #{error.message}",
      updated_at: Time.current)
    Rails.logger.error("[Airtable] sync failed for review ##{review_id}: #{error.class}: #{error.message}")
  end

  private

  def skip(review, reason)
    review.update_columns(airtable_error: reason, updated_at: Time.current)
    Rails.logger.warn("[Airtable] review ##{review.id} skipped: #{reason}")
  end
end
