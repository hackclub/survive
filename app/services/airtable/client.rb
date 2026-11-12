module Airtable
  # Writes to the one submissions table only. Never call the schema API from here.
  class Client
    OPEN_TIMEOUT = 5
    READ_TIMEOUT = 15

    def create(fields)
      response = connection.post(Config.table_url) do |request|
        request.body = JSON.generate({ "fields" => fields })
      end

      interpret(response).fetch("id")
    end

    def update(record_id, fields)
      response = connection.patch("#{Config.table_url}/#{ERB::Util.url_encode(record_id)}") do |request|
        request.body = JSON.generate({ "fields" => fields })
      end

      interpret(response).fetch("id")
    end

    private

    def interpret(response)
      body = parse(response.body)
      return body if response.status.between?(200, 299) && body["id"].present?

      message = "Airtable returned #{response.status}#{error_message(body)}"
      raise Unavailable, message if response.status == 429 || response.status >= 500

      raise Rejected, message
    end

    def error_message(body)
      error = body["error"]
      detail = error.is_a?(Hash) ? [ error["type"], error["message"] ].compact.join(": ") : error.to_s
      detail.present? ? " (#{detail})" : ""
    end

    def parse(body)
      return {} if body.blank?

      parsed = JSON.parse(body)
      parsed.is_a?(Hash) ? parsed : {}
    rescue JSON::ParserError
      {}
    end

    def connection
      @connection ||= Faraday.new(headers: {
        "Authorization" => "Bearer #{Config.api_key}",
        "Content-Type" => "application/json"
      }) do |f|
        f.options.open_timeout = OPEN_TIMEOUT
        f.options.timeout = READ_TIMEOUT
        f.adapter Faraday.default_adapter
      end
    end
  end
end
