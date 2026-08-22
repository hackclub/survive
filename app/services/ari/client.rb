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

    Status = Struct.new(:found, :ship_id, :phase, :decision, :version, :ingest_version, keyword_init: true)

    def ingest(review)
      body = JSON.generate(Payload.build(review))
      interpret(post(Config.ingest_url, body))
    end

    def withdraw(project)
      body = JSON.generate({ "external_id" => project.ari_external_id })
      response = post(Config.withdraw_url, body)

      case response.status
      when 200, 202
        Result.new(status: :withdrawn, code: response.status)
      when 404
        Result.new(status: :not_queued, code: 404, message: "Ari has nothing open for this project.")
      when 401
        Result.new(status: :unauthorized, code: 401, message: "Ari rejected our signature.")
      else
        Result.new(status: :unavailable, code: response.status, message: "Ari returned #{response.status}.")
      end
    end

    def status(external_id)
      response = connection.get(Config.status_url) do |request|
        request.params["external_id"] = external_id
        request.headers["Authorization"] = "Bearer #{Config.ingest_secret}"
      end

      return Status.new(found: false) unless response.status == 200

      body = parse(response.body)
      Status.new(
        found: true,
        ship_id: body["id"].presence,
        phase: body["phase"].presence,
        decision: body["decision"].presence,
        version: body["version"],
        ingest_version: body["ingest_version"]
      )
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
