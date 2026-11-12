require "test_helper"

class HikeGrantTest < ActiveSupport::TestCase
  test "individual allocations are tracked and grant is paid only after every participant is issued" do
    admin = build_maker(roles: ["admin"])
    first_hiker = build_maker
    second_hiker = build_maker
    grant = HikeGrant.create!(
      name: "Blue Mountains hike",
      trail: "Grand Canyon Track",
      region: "Sydney, NSW",
      meeting_point: "Central Station",
      starts_at: 2.weeks.from_now,
      budget_cents: 10_001,
      status: :pending,
      created_by: admin
    )
    first = grant.participants.create!(user: first_hiker, allocation_cents: 5_001)
    second = grant.participants.create!(user: second_hiker, allocation_cents: 5_000)

    assert_equal 10_001, grant.allocated_cents
    grant.approve!(admin)
    assert grant.approved?

    first.mark_issued!(reference: "hcb-grant-one")
    assert grant.reload.approved?, "one issued grant must not mark the whole hike as paid"

    second.mark_issued!(reference: "hcb-grant-two")
    assert grant.reload.paid?
    assert_equal "hcb-grant-one", first.reload.hcb_grant_id
    assert_equal "hcb-grant-two", second.reload.hcb_grant_id
  end

  test "only admins can view and manage Hike Grants" do
    admin = build_maker(roles: ["admin"])
    regular_user = build_maker

    assert HikeGrantPolicy.new(admin, :hike_grant).index?
    assert HikeGrantPolicy.new(admin, :hike_grant).manage?
    refute HikeGrantPolicy.new(regular_user, :hike_grant).index?
    refute HikeGrantPolicy.new(regular_user, :hike_grant).manage?
  end

  test "visibility uses prefixed helpers and keeps the stored values" do
    admin = build_maker(roles: [ "admin" ])
    attrs = { trail: "Track", region: "Sydney, NSW", meeting_point: "Central", starts_at: 1.week.from_now,
      budget_cents: 1_000, status: :pending, created_by: admin }
    open_hike = HikeGrant.create!(attrs.merge(name: "Open", visibility: :public))
    closed_hike = HikeGrant.create!(attrs.merge(name: "Closed", visibility: "private"))

    assert open_hike.visibility_public?
    assert closed_hike.visibility_private?
    assert_equal "public", open_hike.visibility
    assert_equal({ "public" => 0, "private" => 1 }, HikeGrant.visibilities)
    assert_equal [ open_hike ], HikeGrant.visibility_public.to_a
    assert_equal [ open_hike ], HikeGrant.where(visibility: :public).to_a, "the controller's query still works"
    assert_equal Module.instance_method(:public).owner, HikeGrant.method(:public).owner, "Ruby's own public is untouched"
  end
end
