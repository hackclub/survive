require "faraday"
require "json"

module HcaService
  class Error < StandardError; end

  module_function

  def host
    "https://auth.hackclub.com"
  end

  def community?
    ENV["HCA_COMMUNITY"] == "1"
  end

  def scopes
    base_scopes = %w[openid email name profile verification_status slack_id]
    base_scopes += %w[address phone birthdate] unless community?
    base_scopes.join(" ")
  end

  def me(access_token)
    raise ArgumentError, "access_token is required" if access_token.blank?

    response = connection.get("/api/v1/me") do |req|
      req.headers["Authorization"] = "Bearer #{access_token}"
      req.headers["Accept"] = "application/json"
    end

    unless response.success?
      Rails.logger.warn("HCA /me fetch failed with status #{response.status}")
      return nil
    end

    JSON.parse(response.body)
  rescue StandardError => e
    Rails.logger.warn("HCA /me fetch error: #{e.class}")
    nil
  end

  def identity(access_token)
    result = me(access_token)
    result&.dig("identity") || {}
  end

  def connection
    @connection ||= Faraday.new(url: host) do |f|
      f.options.timeout = 10
      f.options.open_timeout = 5
      f.adapter Faraday.default_adapter
    end
  end
end
