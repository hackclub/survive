require "faraday"
require "json"

module CachetService
  module_function

  def host
    "https://cachet.hackclub.com"
  end

  def avatar_url(slack_id)
    return nil if slack_id.blank?

    "#{host}/users/#{slack_id}/r"
  end

  def fetch_display_name(slack_id)
    return nil if slack_id.blank?

    Rails.cache.fetch("cachet_display_name:#{slack_id}", expires_in: 1.day) do
      response = connection.get("users/#{slack_id}")
      next nil unless response.success?

      JSON.parse(response.body)["displayName"]
    end
  rescue StandardError => e
    Rails.logger.warn("CachetService fetch_display_name error: #{e.class}")
    nil
  end

  def connection
    @connection ||= Faraday.new(url: host) do |f|
      f.options.timeout = 10
      f.options.open_timeout = 5
      f.adapter Faraday.default_adapter
    end
  end
end
