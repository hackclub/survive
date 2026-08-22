class Review < ApplicationRecord
  CLAIM_TTL = 20.minutes

  belongs_to :project
  belongs_to :reviewer, class_name: "User", optional: true
  belongs_to :claimed_by, class_name: "User", optional: true
  has_many :hour_entries, -> { order(:hackatime_name) },
           class_name: "ReviewHourEntry", inverse_of: :review, dependent: :destroy

  enum :state, { pending: 0, in_review: 1, approved: 2, rejected: 3, returned: 4 }

  validates :round, numericality: { only_integer: true, greater_than: 0 }
  validates :round, uniqueness: { scope: :project_id }
  validates :claimed_seconds, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :approved_minutes, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :maker_feedback, presence: true, if: :decided?
  validates :reviewer_id, presence: true, if: :decided?

  scope :queued, -> { where(state: %i[pending in_review]) }
  scope :unclaimed_or_claimed_by, ->(user) {
    where("claimed_by_id IS NULL OR claimed_at IS NULL OR claimed_at < ? OR claimed_by_id = ?", CLAIM_TTL.ago, user.id)
  }

  def self.atomic_claim!(id, user)
    now = Time.current
    updated = where(id: id)
      .where("claimed_by_id IS NULL OR claimed_at IS NULL OR claimed_at < ? OR claimed_by_id = ?", now - CLAIM_TTL, user.id)
      .update_all(claimed_by_id: user.id, claimed_at: now, updated_at: now)

    return nil if updated.zero?

    find(id)
  end

  def unclaim!(user)
    self.class.where(id: id, claimed_by_id: user.id).update_all(claimed_by_id: nil, claimed_at: nil, updated_at: Time.current)
  end

  def claim_expired?
    claimed_at.nil? || claimed_at < CLAIM_TTL.ago
  end

  def claimed_by?(user)
    claimed_by_id == user.id && !claim_expired?
  end

  def claimed_by_someone_else?(user)
    claimed_by_id.present? && claimed_by_id != user.id && !claim_expired?
  end

  def decided?
    approved? || rejected? || returned?
  end

  def approved_minutes_total
    hour_entries.sum(:approved_minutes)
  end

  def claimed_minutes_total
    claimed_seconds / 60
  end
end
