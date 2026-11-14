class SlackNotification < ApplicationRecord
  belongs_to :user

  validates :event_key, presence: true, uniqueness: { scope: :user_id }
end
