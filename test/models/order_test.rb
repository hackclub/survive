require "test_helper"

class OrderTest < ActiveSupport::TestCase
  test "refuses a banned maker" do
    maker = build_maker
    give_coins(maker, 500)
    maker.update!(is_banned: true, banned_reason: "test")

    assert_match "suspended", Order.refusal_for(user: maker.reload, shop_item: build_item, quantity: 1)
  end

  test "refuses more than the maximum quantity" do
    maker = give_coins(build_maker, 500)
    item = build_item(max_quantity: 2)

    assert_match "at most 2", Order.refusal_for(user: maker, shop_item: item, quantity: 3)
    assert_nil Order.refusal_for(user: maker, shop_item: item, quantity: 2)
  end

  test "refuses when the maker cannot afford it" do
    maker = give_coins(build_maker, 150)
    item = build_item(coin_cost: 100, max_quantity: 5)

    assert_match "you have 150", Order.refusal_for(user: maker, shop_item: item, quantity: 2)
  end

  test "refuses a second order of a one-per-person item" do
    maker = give_coins(build_maker, 500)
    item = build_item(coin_cost: 50, one_per_person: true)
    Order.place!(user: maker, shop_item: item, quantity: 1)

    assert_match "already claimed", Order.refusal_for(user: maker.reload, shop_item: item, quantity: 1)
  end

  test "a rejected order frees the one-per-person claim" do
    maker = give_coins(build_maker, 500)
    item = build_item(coin_cost: 50, one_per_person: true)
    order = Order.place!(user: maker, shop_item: item, quantity: 1)
    order.reject!(maker, reason: "out of stock")

    assert_nil Order.refusal_for(user: maker.reload, shop_item: item, quantity: 1)
  end

  test "refuses when stock is reserved by held orders" do
    maker = give_coins(build_maker, 500)
    other = give_coins(build_maker, 500)
    item = build_item(coin_cost: 50, stock: 1)
    Order.place!(user: other, shop_item: item, quantity: 1)

    assert_equal 0, item.reload.available_stock
    assert_match "Out of stock", Order.refusal_for(user: maker, shop_item: item, quantity: 1)
  end

  test "refuses a physical item with no address but allows a grant" do
    maker = give_coins(build_maker(address_line1: nil, city: nil, postal_code: nil), 500)

    refusal = Order.refusal_for(user: maker, shop_item: build_item(coin_cost: 50), quantity: 1)
    assert_match "a street address, a city, and a postcode", refusal

    grant = build_item(kind: :grant, coin_cost: 50, grant_amount_usd: 5)
    assert_nil Order.refusal_for(user: maker, shop_item: grant, quantity: 1)
  end

  test "refuses an item locked behind approved hours" do
    maker = give_coins(build_maker, 500)
    item = build_item(coin_cost: 50, min_approved_hours: 10)

    assert_match "Unlocks at 10 approved hours",
      Order.refusal_for(user: maker, shop_item: item, quantity: 1)
  end

  test "refuses an item disabled for the maker's region" do
    maker = give_coins(build_maker(country: "GB"), 500)
    item = build_item(coin_cost: 50)
    item.shop_item_regions.create!(region: "gb", enabled: false)

    assert_match "Not available", Order.refusal_for(user: maker, shop_item: item.reload, quantity: 1)
  end

  test "place! freezes the price, the name and the address" do
    maker = give_coins(build_maker, 500)
    item = build_item(name: "Survive tee", coin_cost: 150, max_quantity: 2)
    order = Order.place!(user: maker, shop_item: item, quantity: 2)

    item.update!(coin_cost: 999, name: "Renamed")
    maker.update!(address_line1: "9 Somewhere Else")

    order.reload
    assert_equal 150, order.frozen_coin_cost
    assert_equal 300, order.total_coins
    assert_equal "Survive tee", order.frozen_item_name
    assert_equal "4 Harrow Rd", order.address["address_line1"]
  end

  test "held states reserve coins and released states free them" do
    maker = give_coins(build_maker, 500)
    order = Order.place!(user: maker, shop_item: build_item(coin_cost: 200), quantity: 1)

    assert_equal 200, maker.reload.coins_held
    assert_equal 300, maker.spendable_coins

    order.approve!(maker)
    assert_equal 200, maker.reload.coins_held, "approved is still held"

    order.update!(state: :fulfilled)
    assert_equal 200, maker.reload.coins_held, "fulfilled is still held"

    order.refund!(maker, reason: "lost in the post")
    assert_equal 0, maker.reload.coins_held
    assert_equal 500, maker.spendable_coins
  end

  test "rejecting frees the coins with no ledger entry" do
    maker = give_coins(build_maker, 500)
    order = Order.place!(user: maker, shop_item: build_item(coin_cost: 200), quantity: 1)

    assert_no_difference -> { CoinAdjustment.count } do
      order.reject!(maker, reason: "out of stock")
    end

    assert_equal 500, maker.reload.spendable_coins
  end

  test "a ban holds open orders and freezes spending" do
    maker = give_coins(build_maker, 500)
    order = Order.place!(user: maker, shop_item: build_item(coin_cost: 200), quantity: 1)

    maker.ban!(maker, reason: "fabricated hours")

    assert_equal "on_hold", order.reload.state
    assert_equal 0, maker.reload.spendable_coins
  end

  test "place! raises with the refusal message" do
    maker = build_maker
    error = assert_raises(Order::NotAllowed) do
      Order.place!(user: maker, shop_item: build_item(coin_cost: 100), quantity: 1)
    end

    assert_match "Needs 100 more coins", error.message
  end

  test "fulfill! only works on an approved order and stores the reference" do
    maker = give_coins(build_maker, 500)
    order = Order.place!(user: maker, shop_item: build_item(coin_cost: 50), quantity: 1)

    assert_raises(Order::NotAllowed) { order.fulfill!(maker) }

    order.approve!(maker)
    order.fulfill!(maker, reference: " 1Z999AA ")

    assert_equal "fulfilled", order.state
    assert_equal "1Z999AA", order.tracking_number
    assert_equal maker, order.fulfilled_by
  end

  test "a grant reference is stored as a link and must be https" do
    maker = give_coins(build_maker, 500)
    item = build_item(kind: :grant, coin_cost: 50, grant_amount_usd: 25)
    order = Order.place!(user: maker, shop_item: item, quantity: 1)
    order.approve!(maker)

    assert_raises(ActiveRecord::RecordInvalid) do
      order.fulfill!(maker, reference: "javascript:alert(1)")
    end

    order.reload.fulfill!(maker, reference: "https://hcb.hackclub.com/g/abc")
    assert_equal "https://hcb.hackclub.com/g/abc", order.hcb_grant_link
    assert_nil order.tracking_number
  end
end
