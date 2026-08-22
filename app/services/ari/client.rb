module Ari
  class Client
    OPEN_TIMEOUT = 5
    READ_TIMEOUT = 15

    Result = Struct.new(:status, :code, :ship_id, :message, keyword_init: true) do
      def accepted?
        status == :accepted
      end

      def retryable?
        status == :unavailable
      end
    end

    def ingest(review)
      body = JSON.generate(Payload.build(review))
      interpret(post(Config.ingest_url, body))
    end

    private

    def post(url, body)
      connection.post(url) do |request|
        request.headers["Content-Type"] = "application/json"
        request.headers["X-Ari-Signature"] = Signature.sign_body(body)
        request.body = body
      end
    end

    def interpret(response)
      code = response.status
      parsed = parse(response.body)
      ship_id = parsed["id"].presence

      case code
      when 200, 201, 202
        Result.new(status: :accepted, code: code, ship_id: ship_id)
      when 401
        Result.new(status: :unauthorized, code: code, message: "Ari rejected our signature.")
      when 409
        Result.new(status: :conflict, code: code, message: "Ari already holds a newer revision of this ship.")
      when 422
        Result.new(status: :invalid, code: code, message: error_message(parsed) || "Ari refused the payload.")
      else
        Result.new(status: :unavailable, code: code, message: "Ari returned #{code}.")
      end
    end

    def parse(body)
      return {} if body.blank?

      JSON.parse(body)
    rescue JSON::ParserError
      {}
    end

    def error_message(parsed)
      [ parsed["error"], parsed["field"], parsed["message"] ].compact.join(" ").presence
    end

    def connection
      @connection ||= Faraday.new do |f|
        f.options.open_timeout = OPEN_TIMEOUT
        f.options.timeout = READ_TIMEOUT
        f.adapter Faraday.default_adapter
      end
    end
  end
end
