module Airtable
  module Config
    module_function

    API_URL = "https://api.airtable.com/v0".freeze

    def api_key
      ENV["AIRTABLE_API_KEY"].presence
    end

    def base_id
      ENV["AIRTABLE_BASE_ID"].presence
    end

    def table
      ENV["AIRTABLE_TABLE"].presence
    end

    def configured?
      api_key.present? && base_id.present? && table.present?
    end

    def missing
      { "AIRTABLE_API_KEY" => api_key, "AIRTABLE_BASE_ID" => base_id, "AIRTABLE_TABLE" => table }
        .select { |_name, value| value.blank? }.keys
    end

    def table_url
      require!
      "#{API_URL}/#{ERB::Util.url_encode(base_id)}/#{ERB::Util.url_encode(table)}"
    end

    def require!
      return if configured?

      raise NotConfigured, "#{missing.to_sentence} must be set"
    end
  end
end
