class HackatimeSyncJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    user = User.find_by(id: user_id)
    return if user.nil?

    HackatimeSyncService.refresh!(user)
  end
end
