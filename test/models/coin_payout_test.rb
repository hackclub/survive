require "test_helper"

class CoinPayoutTest < ActiveSupport::TestCase
  test "coins_for floors partial hours" do
    assert_equal 17, CoinPayout.coins_for(210, 5)
    assert_equal 5, CoinPayout.coins_for(60, 5)
    assert_equal 0, CoinPayout.coins_for(11, 5)
    assert_equal 0, CoinPayout.coins_for(0, 5)
  end

  test "a payout cannot be updated" do
    payout = granted_payout(minutes: 120)

    assert_raises(ActiveRecord::ReadOnlyRecord) { payout.update!(coins: 9_999) }
    assert_equal 10, payout.reload.coins
  end

  test "grant! is idempotent per review" do
    final = pending_final_review(minutes: 120)
    first = CoinPayout.grant!(final)
    second = CoinPayout.grant!(final)

    assert_equal first.id, second.id
    assert_equal 1, CoinPayout.where(review_id: final.review_id).count
  end

  test "grant! records the rate it used" do
    final = pending_final_review(minutes: 120)
    payout = CoinPayout.grant!(final)

    assert_equal CoinPayout.rate_per_hour, payout.rate_per_hour
    assert_equal 120, payout.net_minutes
  end

  private

  def pending_final_review(minutes:, deduction: nil)
    maker = build_maker
    project = build_project(maker)
    review = build_review(project, state: :approved, approved_minutes: minutes,
      ingested_at: 2.days.ago, decided_at: 1.day.ago)
    final = review.open_final_review!
    final.update!(deduction_minutes: deduction) if deduction
    final
  end

  def granted_payout(minutes:)
    CoinPayout.grant!(pending_final_review(minutes: minutes))
  end
end
