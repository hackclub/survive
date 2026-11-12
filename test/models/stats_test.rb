require "test_helper"

class StatsTest < ActiveSupport::TestCase
  setup do
    @user = build_maker
    @today = Time.current.to_date
  end

  test "only admins can see stats" do
    assert StatsPolicy.new(build_maker(roles: [ "admin" ]), :stats).index?
    assert_not StatsPolicy.new(@user, :stats).index?
    assert_not StatsPolicy.new(nil, :stats).index?
  end

  test "a visit is recorded once a day" do
    Rails.cache.clear
    2.times { UserActivityDay.record!(@user) }
    Rails.cache.clear
    UserActivityDay.record!(@user)

    assert_equal 1, UserActivityDay.where(user: @user, day: @today).count
  end

  test "hackatime totals split linked and unlinked projects, and update in place through the day" do
    project = build_project(@user)
    HackatimeProject.create!(user: @user, project: project, name: "survive-thing")
    HackatimeProject.create!(user: @user, name: "other")

    HackatimeDailyTotal.record!(@user, { "survive-thing" => 600, "other" => 400 })
    HackatimeDailyTotal.record!(@user, { "survive-thing" => 900, "other" => 400 })

    row = HackatimeDailyTotal.sole
    assert_equal 1_300, row.total_seconds
    assert_equal 900, row.linked_seconds
  end

  test "someone counts as coding on a day their total went up, not on their first snapshot" do
    other = build_maker
    HackatimeDailyTotal.create!(user: @user, day: @today - 2, total_seconds: 100, linked_seconds: 0)
    HackatimeDailyTotal.create!(user: @user, day: @today - 1, total_seconds: 100, linked_seconds: 0)
    HackatimeDailyTotal.create!(user: @user, day: @today, total_seconds: 3_700, linked_seconds: 1_000)
    HackatimeDailyTotal.create!(user: other, day: @today, total_seconds: 9_999, linked_seconds: 0)

    by_day = Admin::StatsController.new.send(:coding_by_day, (@today - 2)..@today)

    assert_equal 0, by_day[@today - 1][:coding], "no change, not coding"
    assert_equal 1, by_day[@today][:coding], "the other person's first snapshot isn't counted"
    assert_equal 1, by_day[@today][:coding_survive]
    assert_equal 3_600, by_day[@today][:seconds]
    assert_equal 1, Admin::StatsController.new.send(:coding_users, (@today - 6)..@today)
  end
end
