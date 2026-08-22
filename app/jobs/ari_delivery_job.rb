class AriDeliveryJob < ApplicationJob
  queue_as :default

  def perform(delivery_id)
    delivery = AriDelivery.find_by(id: delivery_id)
    return if delivery.nil? || delivery.processed?

    Ari::ApplyDelivery.call(delivery)
  rescue StandardError => e
    delivery&.update_columns(error: "#{e.class}: #{e.message}")
    raise
  end
end
