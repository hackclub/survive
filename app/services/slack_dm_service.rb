class SlackDmService
  class DeliveryError < StandardError; end

  API_URL = "https://slack.com/api".freeze

  def self.deliver(user:, event_key:, text:)
    return :disabled if ENV["SLACK_BOT_TOKEN"].blank?
    return :unlinked if user.slack_id.blank?

    notification = SlackNotification.create_or_find_by!(user: user, event_key: event_key)

    notification.with_lock do
      return :already_sent if notification.sent_at.present?

      opened = post("conversations.open", users: user.slack_id)
      channel_id = opened.dig("channel", "id")
      raise DeliveryError, "Slack did not return a DM channel" if channel_id.blank?

      post("chat.postMessage", channel: channel_id, text: text, mrkdwn: false, unfurl_links: false, unfurl_media: false)
      notification.update!(sent_at: Time.current)
    end

    :sent
  end

  def self.project_url(project)
    "#{app_url}/projects/#{project.id}"
  end

  def self.admin_reviews_url
    "#{app_url}/admin/reviews?filter=all"
  end

  def self.admin_final_reviews_url
    "#{app_url}/admin/final_reviews?filter=pending"
  end

  def self.app_url
    (ENV["APP_HOST"].presence || "https://survive.hackclub.com").delete_suffix("/")
  end

  def self.post(endpoint, payload)
    response = connection.post("/#{endpoint}") do |request|
      request.headers["Authorization"] = "Bearer #{ENV.fetch('SLACK_BOT_TOKEN')}"
      request.headers["Content-Type"] = "application/json; charset=utf-8"
      request.body = payload.to_json
    end

    raise DeliveryError, "Slack returned HTTP #{response.status}" unless response.success?

    body = JSON.parse(response.body)
    raise DeliveryError, "Slack API error: #{body['error'] || 'unknown_error'}" unless body["ok"]

    body
  rescue Faraday::Error, JSON::ParserError => e
    raise DeliveryError, "Slack request failed: #{e.class}"
  end
  private_class_method :post

  def self.connection
    Faraday.new(url: API_URL) do |faraday|
      faraday.options.open_timeout = 5
      faraday.options.timeout = 10
    end
  end
  private_class_method :connection
end
