class HikeGrant < ApplicationRecord
  belongs_to :created_by, class_name: "User"
  belongs_to :reviewed_by, class_name: "User", optional: true
  has_many :participants, class_name: "HikeGrantParticipant", dependent: :destroy

  enum :status, { draft: 0, pending: 1, approved: 2, rejected: 3, paid: 4, completed: 5 }

  validates :name, :trail, :region, :meeting_point, :starts_at, presence: true
  validates :budget_cents, numericality: { only_integer: true, greater_than: 0 }
  validate :allocations_fit_budget

  scope :recent, -> { order(starts_at: :desc, created_at: :desc) }

  def allocated_cents
    participants.sum(:allocation_cents)
  end

  def remaining_cents
    budget_cents - allocated_cents
  end

  def approve!(actor)
    raise ArgumentError, "Only pending grants can be approved." unless pending?
    raise ArgumentError, "Add at least one participant before approving." if participants.empty?
    raise ArgumentError, "Participant allocations exceed the approved budget." if allocated_cents > budget_cents

    update!(status: :approved, reviewed_by: actor, reviewed_at: Time.current, decision_reason: nil)
  end

  def reject!(actor, reason:)
    raise ArgumentError, "A reason is required." if reason.blank?
    update!(status: :rejected, reviewed_by: actor, reviewed_at: Time.current, decision_reason: reason)
  end

  def refresh_payment_status!
    return unless approved? || paid?
    return if participants.empty?

    update!(status: :paid, paid_at: Time.current) if participants.all?(&:issued?)
  end

  private

  def allocations_fit_budget
    return if budget_cents.blank?
    return if participants.loaded? && participants.sum { |participant| participant.allocation_cents.to_i } <= budget_cents
    return if !participants.loaded? && participants.sum(:allocation_cents) <= budget_cents

    errors.add(:budget_cents, "must cover all participant allocations")
  end
end
