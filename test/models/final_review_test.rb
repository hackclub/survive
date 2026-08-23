require "test_helper"

class FinalReviewTest < ActiveSupport::TestCase
  test "passing pays the full approved hours" do
    final, maker = pending(minutes: 210)
    final.pass!(maker, "clean")

    assert_equal "passed", final.reload.status
    assert_equal 17, final.payout.coins
    assert_equal 17, maker.reload.coins_earned
  end

  test "deducting pays the net hours, never the gross" do
    final, maker = pending(minutes: 600)
    final.deduct!(maker, minutes: 240, note: "hours do not match the commits")

    assert_equal "deducted", final.reload.status
    assert_equal 360, final.payout.net_minutes
    assert_equal 30, final.payout.coins
    assert_equal 30, maker.reload.coins_earned
  end

  test "the deduction is applied before coins exist so there is nothing to claw back" do
    final, maker = pending(minutes: 600)

    assert_equal 0, maker.coins_earned, "no coins before the decision"

    final.deduct!(maker, minutes: 600, note: "all of it")

    assert_equal 0, final.payout.coins
    assert_equal 0, maker.reload.coins_earned
    assert_equal 1, CoinPayout.where(review_id: final.review_id).count
  end

  test "banning freezes the maker and pays nothing" do
    final, maker = pending(minutes: 600)
    final.ban!(maker, note: "fabricated hours")

    assert_equal "banned", final.reload.status
    assert maker.reload.is_banned?
    assert_nil final.payout
    assert_equal 0, maker.spendable_coins
  end

  test "voiding writes a compensating adjustment rather than deleting the payout" do
    final, maker = pending(minutes: 600)
    final.pass!(maker, "clean")

    assert_equal 50, maker.reload.coins_earned

    assert_difference -> { CoinAdjustment.count }, 1 do
      final.void!
    end

    assert_equal "voided", final.reload.status
    assert_equal 50, maker.reload.coins_earned, "the payout row survives"
    assert_equal(-50, maker.coins_adjusted)
    assert_equal 0, maker.coin_balance
  end

  test "net_approved_minutes never goes below zero" do
    final, maker = pending(minutes: 60)
    final.deduct!(maker, minutes: 60, note: "all of it")

    assert_equal 0, final.review.reload.net_approved_minutes
  end

  private

  def pending(minutes:)
    maker = build_maker
    project = build_project(maker)
    review = build_review(project, state: :approved, approved_minutes: minutes,
      ingested_at: 2.days.ago, decided_at: 1.day.ago)
    [ review.open_final_review!, maker ]
  end
end
