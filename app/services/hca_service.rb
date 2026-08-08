require "faraday"
require "json"

module HcaService
  class Error < StandardError; end

  module_function

  def host
    "https://auth.hackclub.com"
  end

  def configured?
    ENV["HCA_CLIENT_ID"].present? && ENV["HCA_CLIENT_SECRET"].present?
  end

  def community?
    ENV["HCA_COMMUNITY"] == "1"
  end

  def scopes
    base_scopes = %w[openid email name profile verification_status slack_id]
    base_scopes += %w[address phone birthdate] unless community?
    base_scopes.join(" ")
  end

  def authorize_url(redirect_uri, state, login_hint: nil)
    params = {
      client_id: ENV.fetch("HCA_CLIENT_ID", nil),
      redirect_uri: redirect_uri,
      response_type: "code",
      scope: scopes,
      state: state
    }
    params[:login_hint] = login_hint if login_hint.present?
    "#{host}/oauth/authorize?#{params.to_query}"
  end

  def exchange_code_for_token(code, redirect_uri)
    response = connection.post("/oauth/token") do |req|
      req.headers["Content-Type"] = "application/x-www-form-urlencoded"
      req.body = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        client_id: ENV.fetch("HCA_CLIENT_ID", nil),
        client_secret: ENV.fetch("HCA_CLIENT_SECRET", nil)
      }.to_query
    end

    unless response.success?
      Rails.logger.error("HCA token exchange failed: #{response.status}")
      return nil
    end

    JSON.parse(response.body)
  rescue StandardError => e
    Rails.logger.error("HCA token exchange error: #{e.class}")
    nil
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
