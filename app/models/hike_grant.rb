class HikeGrant < ApplicationRecord
  belongs_to :created_by, class_name: "User"
  belongs_to :reviewed_by, class_name: "User", optional: true
  has_many :participants, class_name: "HikeGrantParticipant", dependent: :destroy
  has_many :items, class_name: "HikeGrantItem", dependent: :destroy
  has_many :contributions, class_name: "HikeGrantContribution", dependent: :destroy

  # A hike only happens once its wood is paid in full. Anyone can chip in. The rate is
  # deliberately never shown on the site.
  DEFAULT_WOOD_PER_USD = 1
  # Pending hikes hold wood; approved ones have spent it. Rejected hikes hold nothing.
  WOOD_STATUSES = %i[pending approved paid completed].freeze

  def self.wood_per_usd
    ENV.fetch("HIKE_WOOD_PER_USD", DEFAULT_WOOD_PER_USD).to_f
  end

  def self.wood_for(cents)
    (cents * wood_per_usd / 100.0).ceil
  end

  enum :status, { draft: 0, pending: 1, approved: 2, rejected: 3, paid: 4, completed: 5 }
  # Prefixed because a bare `public`/`private` would define HikeGrant.public and HikeGrant.private,
  # which clash with Ruby's own methods and stop the app from booting. Helpers are
  # visibility_public? / HikeGrant.visibility_public and so on.
  enum :visibility, { public: 0, private: 1 }, prefix: true

  validates :name, :trail, :region, :meeting_point, :starts_at, presence: true
  validates :budget_cents, numericality: { only_integer: true, greater_than: 0 }
  validate :allocations_fit_budget

  scope :recent, -> { order(starts_at: :desc, created_at: :desc) }

  def wood_raised
    contributions.loaded? ? contributions.sum(&:wood) : contributions.sum(:wood)
  end

  def wood_remaining
    [ wood_needed - wood_raised, 0 ].max
  end

  def funded?
    wood_remaining.zero?
  end

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
    raise ArgumentError, "This hike still needs #{wood_remaining} wood before it can be approved." unless funded?

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
