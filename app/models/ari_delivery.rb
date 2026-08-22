class AriDelivery < ApplicationRecord
  belongs_to :review, optional: true

  validates :delivery_id, presence: true, uniqueness: true
  validates :event, presence: true

  scope :recent, -> { order(received_at: :desc) }
  scope :unprocessed, -> { where(processed_at: nil) }

  def processed?
    processed_at.present?
  end
end
