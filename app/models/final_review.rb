class FinalReview < ApplicationRecord
  CLAIM_TTL = 20.minutes

  FLAG_HACKATIME_FLAGGED = 1 << 0
  FLAG_DUPLICATE_REPO    = 1 << 1
  FLAG_NO_VERIFIED_TIME  = 1 << 2
  FLAG_HOURS_OUTLIER     = 1 << 3
  FLAG_PRIOR_DEDUCTIONS  = 1 << 4
  FLAG_CHECK_FAILED      = 1 << 5

  FLAG_LABELS = {
    FLAG_HACKATIME_FLAGGED => "Hackatime flagged this account",
    FLAG_DUPLICATE_REPO => "Repository used by another project",
    FLAG_NO_VERIFIED_TIME => "No verified Hackatime time",
    FLAG_HOURS_OUTLIER => "Hours well above the programme",
    FLAG_PRIOR_DEDUCTIONS => "Maker has prior deductions",
    FLAG_CHECK_FAILED => "A signal could not be computed"
  }.freeze

  belongs_to :review
  belongs_to :reviewer, class_name: "User", optional: true
  belongs_to :claimed_by, class_name: "User", optional: true

  has_one :project, through: :review

  enum :status, { pending: 0, passed: 1, deducted: 2, banned: 3, voided: 4 }

  validates :review_id, uniqueness: true
  validates :deduction_minutes, numericality: { only_integer: true, greater_than: 0 }, if: :deducted?
  validates :decision_note, presence: true, if: -> { deducted? || banned? }
  validates :reviewer_id, presence: true, if: -> { passed? || deducted? || banned? }

  scope :queued, -> { where(status: :pending) }
  scope :unclaimed_or_claimed_by, ->(user) {
    where("claimed_by_id IS NULL OR claimed_at IS NULL OR claimed_at < ? OR claimed_by_id = ?", CLAIM_TTL.ago, user.id)
  }

  def self.atomic_claim!(id, user)
    now = Time.current
    updated = queued.where(id: id)
      .where("claimed_by_id IS NULL OR claimed_at IS NULL OR claimed_at < ? OR claimed_by_id = ?", now - CLAIM_TTL, user.id)
      .update_all(claimed_by_id: user.id, claimed_at: now, updated_at: now)

    updated.zero? ? nil : find(id)
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

  def raised_flags
    FLAG_LABELS.keys.select { |bit| flags.anybits?(bit) }
  end

  def flag_labels
    raised_flags.map { |bit| FLAG_LABELS.fetch(bit) }
  end

  def net_minutes
    [ review.approved_minutes.to_i - deduction_minutes.to_i, 0 ].max
  end

  def pass!(actor, note)
    transaction do
      update!(status: :passed, reviewer: actor, decided_at: Time.current, decision_note: note.presence, deduction_minutes: nil)
      CoinPayout.grant!(self)
    end
  end

  def deduct!(actor, minutes:, note:)
    transaction do
      update!(status: :deducted, reviewer: actor, decided_at: Time.current, deduction_minutes: minutes, decision_note: note)
      CoinPayout.grant!(self)
    end
  end

  def ban!(actor, note:)
    transaction do
      update!(status: :banned, reviewer: actor, decided_at: Time.current, decision_note: note)
      review.project.user.ban!(actor, reason: note)
    end
  end

  def void!
    transaction do
      reverse_payout!
      update!(status: :voided, decided_at: nil, deduction_minutes: nil, claimed_by: nil, claimed_at: nil)
    end
  end

  def payout
    CoinPayout.find_by(review_id: review_id)
  end

  private

  def reverse_payout!
    granted = payout
    return if granted.nil? || granted.coins.zero?

    CoinAdjustment.create!(
      user: granted.user,
      amount: -granted.coins,
      reason: "Ari reverted round #{review.round} of #{review.project.name}, taking back #{granted.coins} wood"
    )
  end
end
