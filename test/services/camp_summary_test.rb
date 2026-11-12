require "test_helper"

class CampSummaryTest < ActiveSupport::TestCase
  test "the camp summary points at the project that needs changes first" do
    maker = build_maker
    draft = build_project(maker, name: "Draft one")
    returned = build_project(maker, name: "Needs work")
    build_review(returned, state: :returned)

    props = CampSummary.for(maker)
    assert_equal 2, props[:projects]
    assert_equal 1, props[:changes]
    assert_equal 1, props[:drafts]
    assert_equal returned.id, props.dig(:next, :id)
    assert_equal "changes", props.dig(:next, :stage)
    assert_not_equal draft.id, props.dig(:next, :id)
  end
end
