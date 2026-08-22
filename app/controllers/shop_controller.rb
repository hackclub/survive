class ShopController < ApplicationController
  def index
    region = ShopItem.region_for(current_user)
    balance = current_user.spendable_coins
    minutes = approved_minutes

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

  private

  def approved_minutes
    approved = Review.approved.joins(:project).where(projects: { user_id: current_user.id }).sum(:approved_minutes)
    deducted = FinalReview.deducted.joins(review: :project).where(projects: { user_id: current_user.id }).sum(:deduction_minutes)

    [ approved - deducted, 0 ].max
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
