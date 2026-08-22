module Ari
  module Signature
    module_function

    DIGEST = "SHA256".freeze
    DELIVERY_TOLERANCE = 5.minutes

    def sign_body(body, secret: Config.ingest_secret)
      raise NotConfigured, "ARI_INGEST_SECRET is not set" if secret.blank?

      OpenSSL::HMAC.hexdigest(DIGEST, secret, body.to_s)
    end

    def delivery_signature(timestamp:, delivery_id:, body:, secret: Config.webhook_secret)
      raise NotConfigured, "ARI_WEBHOOK_SECRET is not set" if secret.blank?

      OpenSSL::HMAC.hexdigest(DIGEST, secret, "#{timestamp}.#{delivery_id}.#{body}")
    end

    def verify_delivery(body:, signature:, timestamp:, delivery_id:, secret: Config.webhook_secret, now: Time.current)
      return :not_configured if secret.blank?
      return :missing_headers if signature.blank? || timestamp.blank? || delivery_id.blank?
      return :bad_timestamp unless timestamp.to_s.match?(/\A\d+\z/)
      return :stale if (now.to_i - timestamp.to_i).abs > DELIVERY_TOLERANCE.to_i

      expected = delivery_signature(timestamp: timestamp, delivery_id: delivery_id, body: body, secret: secret)
      return :bad_signature unless ActiveSupport::SecurityUtils.secure_compare(signature.to_s, expected)

      :ok
    end
  end
end
