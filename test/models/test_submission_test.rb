require "test_helper"

class TestSubmissionTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  BLOCKED = { "blocking" => [ { "reasoning" => "Repo is not reachable." } ], "warnings" => [] }.freeze

  setup do
    @original_run = SurviveCheckService.method(:run)
    SurviveCheckService.define_singleton_method(:run) { |project:| BLOCKED }

    @admin = build_maker(roles: [ "superadmin" ])
    @project = build_project(@admin, repo_link: "https://github.com/admin/test", demo_link: "https://example.test")
    HackatimeProject.create!(user: @admin, project: @project, name: "test-project")
  end

  teardown do
    original = @original_run
    SurviveCheckService.define_singleton_method(:run) { |project:| original.call(project: project) }
  end

  test "a normal submit is still blocked by failing checks" do
    assert_raises(Project::NotReadyToSubmit) { @project.submit! }
    assert_equal 0, @project.reviews.count
  end

  test "a test submit skips the blocking checks, flags the review and sends it to Ari" do
    review = nil
    assert_enqueued_with(job: AriIngestJob) { review = @project.submit!(as_test: true) }

    assert review.test_submission?
    assert_equal BLOCKED["blocking"], review.checks["blocking"], "checks are still recorded"
  end

  test "an approved test never opens a final review, so it can never pay wood" do
    review = @project.submit!(as_test: true)
    review.update!(state: :approved, approved_minutes: 120, decided_at: Time.current)

    assert_nil review.open_final_review!
    assert_nil review.reload.final_review
  end

  test "approved test minutes don't count toward the maker's hours" do
    review = @project.submit!(as_test: true)
    review.update!(state: :approved, approved_minutes: 120)

    assert_equal 0, @admin.approved_minutes
  end

  test "Ari and Airtable both see it marked as a test" do
    review = @project.submit!(as_test: true)
    review.update!(state: :approved, approved_minutes: 60, decided_at: Time.current)

    payload = Ari::Payload.new(review)
    assert_equal({ "Test submission" => Ari::Payload::TEST_NOTE }, payload.send(:meta).slice("Test submission"))

    fields = Airtable::Submission.fields(review)
    assert fields["Description"].start_with?("[#{Airtable::Submission::TEST_BANNER}]")
    assert fields["Optional - Override Hours Spent Justification"].start_with?(Airtable::Submission::TEST_BANNER)
  end

  test "only a superadmin can send a test, and only for their own project" do
    assert ProjectPolicy.new(@admin, @project).submit_test?

    admin = build_maker(roles: [ "admin" ])
    assert_not ProjectPolicy.new(admin, build_project(admin)).submit_test?

    someone = build_maker
    assert_not ProjectPolicy.new(@admin, build_project(someone)).submit_test?
  end
end
