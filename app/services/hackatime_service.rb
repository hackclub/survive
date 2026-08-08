require "faraday"
require "json"

module HackatimeService
  module_function

  def host
    "https://hackatime.hackclub.com"
  end

  def fetch_authenticated_user(access_token)
    return nil if access_token.blank?

    response = connection.get("authenticated/me") do |req|
      req.headers["Authorization"] = "Bearer #{access_token}"
    end

    return nil unless response.success?

    JSON.parse(response.body)["id"]&.to_s
  rescue StandardError => e
    Rails.logger.error("HackatimeService fetch_authenticated_user error: #{e.class}")
    nil
  end

  def connection
    @connection ||= Faraday.new(url: "#{host}/api/v1") do |f|
      f.options.timeout = 10
      f.options.open_timeout = 5
      f.adapter Faraday.default_adapter
    end
  end
end
