class AriWebhooksController < ActionController::Base
  skip_forgery_protection

  def create
    body = request.raw_post

    case verify(body)
    when :not_configured then return head :service_unavailable
    when :missing_headers, :bad_timestamp then return head :bad_request
    when :stale, :bad_signature then return head :unauthorized
    end

    payload = parse(body)
    return head :bad_request if payload.nil?

    record(payload)
  end

  private

  def verify(body)
    Ari::Signature.verify_delivery(
      body: body,
      signature: request.headers["X-Ari-Signature"],
      timestamp: request.headers["X-Ari-Timestamp"],
      delivery_id: delivery_id
    )
  end

  def delivery_id
    request.headers["X-Ari-Delivery-Id"]
  end

  def parse(body)
    parsed = JSON.parse(body.to_s)
    parsed.is_a?(Hash) ? parsed : nil
  rescue JSON::ParserError
    nil
  end

  def record(payload)
    return head :ok if AriDelivery.exists?(delivery_id: delivery_id)

    AriDelivery.create!(
      delivery_id: delivery_id,
      event: payload["event"].presence || "unknown",
      external_id: payload["external_id"],
      review: review_for(payload),
      payload: payload,
      received_at: Time.current
    )

    Rails.logger.info("[Ari] stored delivery #{delivery_id} #{payload['event']} for #{payload['external_id']}")
    head :accepted
  rescue ActiveRecord::RecordNotUnique
    head :ok
  end

  def review_for(payload)
    ship_id = payload["id"].presence
    found = Review.find_by(ari_ship_id: ship_id) if ship_id
    return found if found

    project_id = payload["external_id"].to_s.delete_prefix("survive-")
    return nil unless project_id.match?(/\A\d+\z/)

    Project.find_by(id: project_id)&.latest_review
  end
end
