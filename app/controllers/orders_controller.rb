class OrdersController < ApplicationController
  def index
    authorize Order

    orders = current_user.orders.includes(:shop_item).recent

    render inertia: "Orders/Index", props: {
      orders: orders.map { |order| serialize(order) },
      balance: current_user.spendable_coins,
      held: current_user.coins_held
    }
  end

  def create
    authorize Order

    item = ShopItem.find(params[:shop_item_id])
    order = Order.place!(user: current_user, shop_item: item, quantity: params[:quantity].to_i.clamp(1, 100))

    redirect_to orders_path, notice: "Ordered #{order.frozen_item_name}. #{order.total_coins} coins are held until it is decided."
  rescue Order::NotAllowed => e
    redirect_to shop_item_path(params[:shop_item_id]), alert: e.message
  rescue ActiveRecord::RecordInvalid => e
    redirect_to shop_item_path(params[:shop_item_id]), alert: e.record.errors.full_messages.to_sentence
  end

  private

  def serialize(order)
    {
      id: order.id,
      name: order.frozen_item_name,
      kind: order.kind,
      state: order.state,
      quantity: order.quantity,
      coins: order.total_coins,
      held: order.held?,
      amountUsd: order.amount_usd&.to_f,
      rejectionReason: order.rejection_reason,
      trackingNumber: order.tracking_number,
      grantLink: order.hcb_grant_link,
      placedAt: order.created_at.strftime("%b %d, %Y"),
      addressLines: order.address_lines
    }
  end
end
