require "test_helper"

class HikeGrantSubmissionTest < ActiveSupport::TestCase
  setup do
    @organiser = build_maker
    @friend = build_maker
    give_coins(@organiser, 100)
    give_coins(@friend, 100)
  end

  def attrs
    { name: "Ridge walk", trail: "Ridge Track", region: "Somewhere", meeting_point: "Station",
      starts_at: 1.week.from_now, visibility: "public" }
  end

  def submit(items:, emails: [ @organiser.email, @friend.email ])
    HikeGrantSubmission.create!(organiser: @organiser, attributes: attrs, items: items, emails: emails)
  end

  FUEL = { kind: "fuel", amount: "30", reason: "Driving four of us to the trailhead." }.freeze
  FOOD = { kind: "food", amount: "21.50", reason: "Lunch and water for the day." }.freeze

  test "the budget is the sum of the costs and each hiker's share is held in wood" do
    grant = submit(items: [ FUEL, FOOD ])

    assert_equal 5_150, grant.budget_cents
    assert_equal [ "fuel", "food" ], grant.items.order(:id).pluck(:kind)
    assert_equal [ 2_575, 2_575 ], grant.participants.order(:id).pluck(:allocation_cents)
    assert_equal [ 26, 26 ], grant.participants.pluck(:wood_cost), "$25.75 rounds up to 26 wood"
    assert_equal 74, @organiser.reload.spendable_coins
    assert_equal 74, @friend.reload.spendable_coins
  end

  test "rejecting the hike gives the wood back, approving keeps it spent" do
    grant = submit(items: [ FUEL ])
    admin = build_maker(roles: [ "admin" ])

    grant.approve!(admin)
    assert_equal 85, @friend.reload.spendable_coins

    other = submit(items: [ FOOD ])
    other.reject!(admin, reason: "Too far")
    assert_equal 85, @friend.reload.spendable_coins
  end

  test "every cost needs a reason" do
    error = assert_raises(HikeGrantSubmission::Refused) { submit(items: [ FUEL.merge(reason: "gas") ]) }

    assert_match "Fuel for a car lift", error.message
    assert_equal 0, HikeGrant.count
  end

  test "no costs, unknown kinds and zero amounts are refused" do
    assert_raises(HikeGrantSubmission::Refused) { submit(items: []) }
    assert_raises(HikeGrantSubmission::Refused) { submit(items: [ FUEL.merge(kind: "jetski") ]) }
    assert_raises(HikeGrantSubmission::Refused) { submit(items: [ FUEL.merge(amount: "0") ]) }
    assert_raises(HikeGrantSubmission::Refused) { submit(items: [ FUEL.merge(amount: "lots") ]) }
  end

  test "a hiker without enough wood stops the hike and nothing is held" do
    broke = build_maker

    error = assert_raises(HikeGrantSubmission::Refused) { submit(items: [ FUEL ], emails: [ @organiser.email, broke.email ]) }

    assert_match broke.email, error.message
    assert_equal 0, HikeGrant.count
    assert_equal 100, @organiser.reload.spendable_coins
  end

  test "adding people re-splits the cost and frees part of everyone's hold" do
    grant = submit(items: [ FUEL ])
    third = build_maker
    give_coins(third, 50)

    HikeGrantSubmission.add_participants!(grant, [ third.email ])

    assert_equal [ 10, 10, 10 ], grant.participants.reload.pluck(:wood_cost)
    assert_equal 90, @organiser.reload.spendable_coins
    assert_equal 40, third.reload.spendable_coins
  end

  test "the wood rate comes from HIKE_WOOD_PER_USD" do
    previous = ENV["HIKE_WOOD_PER_USD"]
    ENV["HIKE_WOOD_PER_USD"] = "2"

    assert_equal 60, HikeGrant.wood_for(3_000)
  ensure
    previous.nil? ? ENV.delete("HIKE_WOOD_PER_USD") : ENV["HIKE_WOOD_PER_USD"] = previous
  end
end
