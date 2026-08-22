class ShopController < ApplicationController
  def index
    region = ShopItem.region_for(current_user)
    balance = current_user.spendable_coins
    minutes = current_user.approved_minutes

    items = ShopItem.includes(:shop_item_regions, image_attachment: :blob).sorted.map do |item|
      next unless item.enabled? || item.region_row(region)&.enabled?

      serialize(item, region, balance, minutes)
    end.compact

    render inertia: "Shop/Index", props: {
      items: items,
      balance: balance,
      trueBalance: current_user.coin_balance,
      frozen: current_user.is_banned?,
      approvedMinutes: minutes,
      region: region
    }
  end

  def show
    item = ShopItem.find(params[:id])
    region = ShopItem.region_for(current_user)
    balance = current_user.spendable_coins
    quantity = 1

    render inertia: "Shop/Show", props: {
      item: serialize(item, region, balance, current_user.approved_minutes).merge(
        maxQuantity: item.max_quantity,
        grantAmountUsd: item.grant_amount_usd&.to_f
      ),
      balance: balance,
      addressLines: address_lines,
      refusal: Order.refusal_for(user: current_user, shop_item: item, quantity: quantity)
    }
  end

  private

  def address_lines
    Order::ADDRESS_FIELDS.filter_map { |field| current_user.public_send(field).presence }
  end

  def serialize(item, region, balance, minutes)
    cost = item.coin_cost_for(region)

    {
      id: item.id,
      name: item.name,
      description: item.description,
      kind: item.kind,
      imageUrl: item.image_url,
      coinCost: cost,
      stock: item.stock,
      onePerPerson: item.one_per_person,
      minApprovedHours: item.min_approved_hours,
      unavailableReason: item.unavailable_reason(current_user, approved_minutes: minutes, balance: balance),
      shortBy: [ cost - balance, 0 ].max
    }
  end
end
