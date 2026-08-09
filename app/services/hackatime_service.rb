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

  def fetch_api_key(access_token)
    return nil if access_token.blank?

    response = connection.get("authenticated/api_keys") do |req|
      req.headers["Authorization"] = "Bearer #{access_token}"
    end

    return nil unless response.success?

    JSON.parse(response.body)["token"]
  rescue StandardError => e
    Rails.logger.error("HackatimeService fetch_api_key error: #{e.class}")
    nil
  end

  def fetch_stats(hackatime_uid, access_token: nil)
    return nil if hackatime_uid.blank?

    response, fell_back = stats_request(hackatime_uid, access_token: access_token)
    return nil unless response&.success?

    data = JSON.parse(response.body)
    projects = data.dig("data", "projects") || []

    {
      projects: projects.to_h { |p| [ p["name"], p["total_seconds"].to_i ] },
      banned: data.dig("trust_factor", "trust_value") == 1,
      token_stale: fell_back
    }
  rescue StandardError => e
    Rails.logger.error("HackatimeService fetch_stats error: #{e.class}")
    nil
  end

  def resolve_api_key(hackatime_uid, access_token)
    cached = Rails.cache.read(api_key_cache_key(hackatime_uid))
    return cached if cached.present?

    key = fetch_api_key(access_token)
    Rails.cache.write(api_key_cache_key(hackatime_uid), key, expires_in: 1.week) if key.present?
    key
  end

  def stats_request(hackatime_uid, access_token: nil)
    params = { features: "projects" }

    if access_token.present?
      api_key = resolve_api_key(hackatime_uid, access_token)
      if api_key
        response = connection.get("users/my/stats", params) do |req|
          req.headers["Authorization"] = "Bearer #{api_key}"
        end
        return [ response, false ] if response.success?

        Rails.cache.delete(api_key_cache_key(hackatime_uid))
      end

      Rails.logger.warn("HackatimeService falling back to public API for uid=#{hackatime_uid}")
    end

    [ connection.get("users/#{hackatime_uid}/stats", params), access_token.present? ]
  end

  def api_key_cache_key(hackatime_uid)
    "hackatime_api_key:#{hackatime_uid}"
  end

  def connection
    @connection ||= Faraday.new(url: "#{host}/api/v1") do |f|
      f.options.timeout = 10
      f.options.open_timeout = 5
      f.adapter Faraday.default_adapter
    end
  end
end
