class SlackOrderApprovedJob < ApplicationJob
  queue_as :default

  discard_on ActiveRecord::RecordNotFound

  def perform(order_id)
    order = Order.includes(:user).find(order_id)
    return unless order.approved?

    maker = order.user
    SlackDmJob.perform_later(
      maker.id,
      "order-approved:#{order.id}:#{order.updated_at.to_i}",
      "Your Survive reward order for “#{order.frozen_item_name}” has been approved and is waiting for fulfilment. We’ll DM you again when it has been sent. #{SlackDmService.app_url}/orders"
    )

    User.where("roles && ARRAY['fulfiller', 'admin', 'superadmin']::varchar[]").where.not(slack_id: [ nil, "" ]).find_each do |fulfiller|
      SlackDmJob.perform_later(
        fulfiller.id,
        "fulfillment-queue:#{order.id}:#{order.updated_at.to_i}",
        "A Survive reward is ready to fulfil: “#{order.frozen_item_name}” for #{maker.display_name}. Open the fulfilment queue: #{SlackDmService.admin_fulfillment_url}"
      )
    end
  end
end
