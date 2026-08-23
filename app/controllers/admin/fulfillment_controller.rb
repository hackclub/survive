class Admin::FulfillmentController < ApplicationController
  def index
    authorize Order, :fulfill?

    pagy, orders = pagy(Order.awaiting_fulfillment.includes(:user, :shop_item).order(:created_at))

    render inertia: "Admin/Fulfillment/Index", props: {
      orders: orders.map { |order| serialize(order) },
      waiting: Order.awaiting_fulfillment.count,
      pagination: { page: pagy.page, pages: pagy.pages, count: pagy.count }
    }
  end

  def fulfill
    order = Order.find(params[:id])
    authorize order, :fulfill?

    unless order.approved?
      return redirect_to(admin_fulfillment_index_path, alert: "#{order.frozen_item_name} is not waiting to be sent.")
    end

    order.fulfill!(current_user, reference: params[:reference])
    audit!("order.fulfilled", target: order, metadata: { user_id: order.user_id, item: order.frozen_item_name })
    redirect_to admin_fulfillment_index_path, notice: "Marked #{order.frozen_item_name} as sent."
  rescue Order::NotAllowed => e
    redirect_to admin_fulfillment_index_path, alert: e.message
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_fulfillment_index_path, alert: e.record.errors.full_messages.to_sentence
  end

  private

  def serialize(order)
    {
      id: order.id,
      name: order.frozen_item_name,
      kind: order.kind,
      quantity: order.quantity,
      region: order.region,
      amountUsd: order.amount_usd&.to_f,
      makerName: order.user.display_name,
      makerEmail: order.user.email,
      addressLines: order.address_lines,
      approvedAt: order.reviewed_at&.strftime("%b %d, %H:%M"),
      placedAt: order.created_at.strftime("%b %d, %H:%M")
    }
  end
end
