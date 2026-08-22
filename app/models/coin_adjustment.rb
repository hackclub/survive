class CoinAdjustment < ApplicationRecord
  belongs_to :user
  belongs_to :actor, class_name: "User", optional: true

  validates :amount, numericality: { only_integer: true, other_than: 0 }
  validates :reason, presence: true

  scope :recent, -> { order(created_at: :desc) }
end
