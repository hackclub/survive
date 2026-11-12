class CoinPayout < ApplicationRecord
  DEFAULT_RATE_PER_HOUR = 5

  belongs_to :review
  belongs_to :user
  belongs_to :project

  validates :review_id, uniqueness: true
  validates :net_minutes, :coins, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :rate_per_hour, numericality: { only_integer: true, greater_than: 0 }

  before_update { raise ActiveRecord::ReadOnlyRecord, "coin payouts are immutable" }

  scope :recent, -> { order(granted_at: :desc) }

  def self.rate_per_hour
    ENV.fetch("COIN_RATE_PER_HOUR", DEFAULT_RATE_PER_HOUR).to_i
  end

  def self.coins_for(minutes, rate)
    (minutes.to_i / 60.0 * rate).floor
  end

  def self.grant!(final_review)
    existing = find_by(review_id: final_review.review_id)
    return existing if existing

    review = final_review.review
    raise ArgumentError, "Test submissions never pay wood." if review.test_submission?

    minutes = review.net_approved_minutes.to_i
    rate = rate_per_hour

    create!(
      review: review,
      user: review.project.user,
      project: review.project,
      net_minutes: minutes,
      rate_per_hour: rate,
      coins: coins_for(minutes, rate),
      granted_at: Time.current
    )
  end
end
