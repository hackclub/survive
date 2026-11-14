class SlackDmJob < ApplicationJob
  queue_as :default

  retry_on SlackDmService::DeliveryError, wait: :polynomially_longer, attempts: 5
  discard_on ActiveRecord::RecordNotFound

  def perform(user_id, event_key, text)
    user = User.find(user_id)
    SlackDmService.deliver(user: user, event_key: event_key, text: text)
  end
end
