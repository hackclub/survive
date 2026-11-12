require "test_helper"

class Airtable::SyncTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  ENV_VARS = {
    "AIRTABLE_API_KEY" => "pat_test",
    "AIRTABLE_BASE_ID" => "appTEST",
    "AIRTABLE_TABLE" => "YSWS Project Submission",
    "ARI_PROGRAM_ID" => "prog_test"
  }.freeze

  TABLE_URL = "https://api.airtable.com/v0/appTEST/YSWS%20Project%20Submission".freeze

  setup do
    @saved_env = ENV_VARS.keys.index_with { |key| ENV[key] }
    ENV.update(ENV_VARS)

    @requests = []
    @stubs = Faraday::Adapter::Test::Stubs.new
    stubs = @stubs
    Airtable::Client.class_eval do
      alias_method :__real_connection, :connection
      define_method(:connection) do
        @connection ||= Faraday.new(headers: { "Authorization" => "Bearer #{Airtable::Config.api_key}" }) do |f|
          f.adapter :test, stubs
        end
      end
    end

    maker = build_maker(first_name: "Ada", last_name: "Lovelace", birthday: Date.new(2010, 5, 1),
      hackatime_uid: "42", state: "Greater London")
    @project = build_project(maker, repo_link: "https://github.com/ada/engine", demo_link: "https://ada.example.test",
      description: "  A difference engine.  ")
    HackatimeProject.create!(user: maker, project: @project, name: "engine")
    @review = build_review(@project, state: :approved, approved_minutes: 330, decided_at: Time.zone.local(2026, 11, 1),
      ari_reviewer_email: "reviewer@example.test", ari_ship_id: "shp_1")
  end

  teardown do
    @saved_env.each { |key, value| value.nil? ? ENV.delete(key) : ENV[key] = value }
    Airtable::Client.class_eval do
      alias_method :connection, :__real_connection
      remove_method :__real_connection
    end
  end

  test "submission uses the exact template field names and never automation fields" do
    fields = Airtable::Submission.fields(@review)

    assert_equal "https://github.com/ada/engine", fields["Code URL"]
    assert_equal "https://ada.example.test", fields["Playable URL"]
    assert_equal "ada", fields["GitHub Username"]
    assert_equal "A difference engine.", fields["Description"]
    assert_equal "2010-05-01", fields["Birthday"]
    assert_equal "Greater London", fields["State / Province"]
    assert_equal "N1 1AA", fields["ZIP / Postal Code"]
    assert_equal 5.5, fields["Optional - Override Hours Spent"]
    assert_equal "42", fields["Justification - Submitter Hackatime ID"]
    assert_includes fields["Optional - Override Hours Spent Justification"], "reviewer@example.test"
    assert_includes fields["Optional - Override Hours Spent Justification"], "5.50 hours"
    assert_includes fields["Optional - Override Hours Spent Justification"], "https://ari.hackclub.com/p/prog_test"
    assert_includes fields["Justification - Hackatime Project Name(s) + Date Range(s)"], "engine"
    assert fields.keys.none? { |key| key.start_with?("Automation", "Loops") }
    assert_not fields.key?("Address (Line 2)"), "blank values are left out"
  end

  test "first sync creates a record and stores its id" do
    @stubs.post(TABLE_URL) do |env|
      @requests << JSON.parse(env.body)
      [ 200, {}, { id: "recNEW1", fields: {} }.to_json ]
    end

    AirtableSyncJob.perform_now(@review.id)

    @review.reload
    assert_equal "recNEW1", @review.airtable_record_id
    assert_nil @review.airtable_error
    assert_equal 5.5, @requests.first.dig("fields", "Optional - Override Hours Spent")
  end

  test "a resend updates the existing record instead of creating another" do
    @review.update_columns(airtable_record_id: "recOLD1")
    @stubs.patch("#{TABLE_URL}/recOLD1") { [ 200, {}, { id: "recOLD1" }.to_json ] }

    AirtableSyncJob.perform_now(@review.id)

    @stubs.verify_stubbed_calls
    assert_equal "recOLD1", @review.reload.airtable_record_id
  end

  test "an Airtable refusal is recorded, not raised" do
    @stubs.post(TABLE_URL) do
      [ 422, {}, { error: { type: "UNKNOWN_FIELD_NAME", message: "Unknown field name" } }.to_json ]
    end

    assert_nothing_raised { AirtableSyncJob.perform_now(@review.id) }

    @review.reload
    assert_nil @review.airtable_record_id
    assert_includes @review.airtable_error, "UNKNOWN_FIELD_NAME"
  end

  test "missing config skips without calling Airtable" do
    ENV.delete("AIRTABLE_API_KEY")

    AirtableSyncJob.perform_now(@review.id)

    assert_includes @review.reload.airtable_error, "AIRTABLE_API_KEY"
  end

  test "an Ari approval enqueues the Airtable sync" do
    pending = build_review(build_project(@project.user), state: :pending)
    delivery = AriDelivery.create!(delivery_id: "dlv_air", event: "review.approved", review: pending,
      payload: { "id" => "shp_air", "review" => { "approved_minutes" => 60 } }, received_at: Time.current)

    assert_enqueued_with(job: AirtableSyncJob, args: [ pending.id ]) { Ari::ApplyDelivery.call(delivery) }
  end
end
