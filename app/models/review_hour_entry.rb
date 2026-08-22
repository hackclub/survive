class ReviewHourEntry < ApplicationRecord
  belongs_to :review, inverse_of: :hour_entries

  enum :verdict, { approved: 0, reduced: 1, rejected: 2 }

  validates :hackatime_name, presence: true
  validates :hackatime_name, uniqueness: { scope: :review_id }
  validates :claimed_seconds, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :approved_minutes, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :note, presence: true, if: -> { reduced? || rejected? }

  def claimed_minutes
    claimed_seconds / 60
  end
end
