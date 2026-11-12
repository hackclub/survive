require "test_helper"

class HikeGrantSubmissionTest < ActiveSupport::TestCase
  setup do
    @organiser = build_maker
    @friend = build_maker
    give_coins(@organiser, 100)
    give_coins(@friend, 100)
    @admin = build_maker(roles: [ "admin" ])
  end

  def attrs
    { name: "Ridge walk", trail: "Ridge Track", region: "Somewhere", meeting_point: "Station",
      starts_at: 1.week.from_now, visibility: "public" }
  end

  def submit(items: [ FUEL ], emails: [ @organiser.email, @friend.email ], wood: 0)
    HikeGrantSubmission.create!(organiser: @organiser, attributes: attrs, items: items, emails: emails, wood: wood)
  end

  FUEL = { kind: "fuel", amount: "30", reason: "Driving four of us to the trailhead." }.freeze
  FOOD = { kind: "food", amount: "21.50", reason: "Lunch and water for the day." }.freeze

  test "the hike needs wood for its whole cost, and hikers aren't charged just for being on it" do
    grant = submit(items: [ FUEL, FOOD ])

    assert_equal 5_150, grant.budget_cents
    assert_equal 52, grant.wood_needed, "$51.50 rounds up"
    assert_equal [ 2_575, 2_575 ], grant.participants.order(:id).pluck(:allocation_cents)
    assert_equal 100, @friend.reload.spendable_coins
    assert_not grant.funded?
  end

  test "the organiser can pay some up front" do
    grant = submit(wood: 20)

    assert_equal 20, grant.wood_raised
    assert_equal 80, @organiser.reload.spendable_coins
    assert_equal 20, @organiser.hike_wood_held
  end

  test "anyone can chip in, even someone not on the hike" do
    grant = submit
    stranger = build_maker
    give_coins(stranger, 50)

    HikeGrantSubmission.contribute!(grant, stranger, 25)

    assert_equal 25, grant.wood_raised
    assert_equal 25, stranger.reload.spendable_coins
  end

  test "it can't be approved until every bit of wood is in" do
    grant = submit(wood: 10)

    error = assert_raises(ArgumentError) { grant.approve!(@admin) }
    assert_match "20 wood", error.message

    HikeGrantSubmission.contribute!(grant, @friend, 20)
    grant.approve!(@admin)
    assert grant.approved?
    assert_equal 80, @friend.reload.spendable_coins, "approved wood stays spent"
  end

  test "a hike can't be overpaid, and nobody can spend wood they don't have" do
    grant = submit
    broke = build_maker

    assert_raises(HikeGrantSubmission::Refused) { HikeGrantSubmission.contribute!(grant, @friend, 31) }
    assert_raises(HikeGrantSubmission::Refused) { HikeGrantSubmission.contribute!(grant, broke, 1) }
    assert_raises(HikeGrantSubmission::Refused) { HikeGrantSubmission.contribute!(grant, @friend, "abc") }
    assert_raises(HikeGrantSubmission::Refused) { HikeGrantSubmission.contribute!(grant, @friend, -5) }
    assert_equal 0, grant.wood_raised
  end

  test "rejecting the hike gives everyone's wood back" do
    grant = submit(wood: 10)
    HikeGrantSubmission.contribute!(grant, @friend, 15)

    grant.reject!(@admin, reason: "Too far")

    assert_equal 100, @organiser.reload.spendable_coins
    assert_equal 100, @friend.reload.spendable_coins
  end

  test "wood can be taken back while pending, but not after review" do
    grant = submit
    HikeGrantSubmission.contribute!(grant, @friend, 10)
    HikeGrantSubmission.contribute!(grant, @friend, 5)

    assert_equal 15, HikeGrantSubmission.withdraw!(grant, @friend)
    assert_equal 100, @friend.reload.spendable_coins

    HikeGrantSubmission.contribute!(grant, @friend, 30)
    grant.approve!(@admin)
    assert_raises(HikeGrantSubmission::Refused) { HikeGrantSubmission.withdraw!(grant, @friend) }
  end

  test "chipping in stops once the hike is reviewed" do
    grant = submit
    grant.reject!(@admin, reason: "No")

    assert_raises(HikeGrantSubmission::Refused) { HikeGrantSubmission.contribute!(grant, @friend, 5) }
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

  test "paying more up front than you have stops the whole hike" do
    poor = build_maker
    give_coins(poor, 5)

    assert_raises(HikeGrantSubmission::Refused) do
      HikeGrantSubmission.create!(organiser: poor, attributes: attrs, items: [ FUEL ], emails: [ poor.email ], wood: 10)
    end
    assert_equal 0, HikeGrant.count
  end

  test "adding people re-splits the money but not the wood" do
    grant = submit
    third = build_maker

    HikeGrantSubmission.add_participants!(grant, [ third.email ])

    assert_equal [ 1_000, 1_000, 1_000 ], grant.participants.reload.pluck(:allocation_cents)
    assert_equal 30, grant.reload.wood_needed
  end
end
