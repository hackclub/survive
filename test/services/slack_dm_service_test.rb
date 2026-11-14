require "test_helper"
require "faraday/adapter/test"

class SlackDmServiceTest < ActiveSupport::TestCase
  test "opens a DM and sends a notification only once for an event" do
    user = build_maker(slack_id: "U123")
    stubs = Faraday::Adapter::Test::Stubs.new do |stub|
      stub.post("/conversations.open") do
        [ 200, { "Content-Type" => "application/json" }, { ok: true, channel: { id: "D123" } }.to_json ]
      end
      stub.post("/chat.postMessage") do
        [ 200, { "Content-Type" => "application/json" }, { ok: true, ts: "123.456" }.to_json ]
      end
    end
    test_connection = Faraday.new(url: SlackDmService::API_URL) do |faraday|
      faraday.adapter :test, stubs
    end

    previous_token = ENV["SLACK_BOT_TOKEN"]
    ENV["SLACK_BOT_TOKEN"] = "xoxb-test-token"

    SlackDmService.stub(:connection, test_connection) do
      assert_equal :sent, SlackDmService.deliver(user: user, event_key: "test-event", text: "Hello")
      assert_equal :already_sent, SlackDmService.deliver(user: user, event_key: "test-event", text: "Hello again")
    end

    notification = SlackNotification.find_by!(user: user, event_key: "test-event")
    assert_not_nil notification.sent_at
    stubs.verify_stubbed_calls
  ensure
    ENV["SLACK_BOT_TOKEN"] = previous_token
  end

  test "skips users without a Slack ID" do
    user = build_maker(slack_id: nil)

    assert_equal :unlinked, SlackDmService.deliver(user: user, event_key: "no-slack", text: "Hello")
    assert_not SlackNotification.exists?(user: user, event_key: "no-slack")
  end
end
