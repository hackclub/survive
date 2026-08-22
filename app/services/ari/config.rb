module Ari
  module Config
    module_function

    DEFAULT_BASE_URL = "https://webhooks.ari.hackclub.com".freeze

    def base_url
      (ENV["ARI_BASE_URL"].presence || DEFAULT_BASE_URL).sub(%r{/+\z}, "")
    end

    def program_id
      ENV["ARI_PROGRAM_ID"].presence
    end

    def ingest_secret
      ENV["ARI_INGEST_SECRET"].presence
    end

    def webhook_secret
      ENV["ARI_WEBHOOK_SECRET"].presence
    end

    def ingest_configured?
      program_id.present? && ingest_secret.present?
    end

    def webhook_configured?
      webhook_secret.present?
    end

    def ingest_url
      require_ingest!
      "#{base_url}/api/ingest/#{program_id}"
    end

    def withdraw_url
      "#{ingest_url}/withdraw"
    end

    def status_url
      "#{ingest_url}/status"
    end

    def require_ingest!
      return if ingest_configured?

      raise NotConfigured, "ARI_PROGRAM_ID and ARI_INGEST_SECRET must both be set"
    end
  end
end
