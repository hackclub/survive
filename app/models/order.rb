class Order < ApplicationRecord
  class NotAllowed < StandardError; end

  CLAIM_TTL = 20.minutes
  HELD_STATES = %w[pending approved on_hold fulfilled].freeze
  ADDRESS_FIELDS = %w[address_line1 address_line2 city state country postal_code].freeze
  REQUIRED_ADDRESS_FIELDS = {
    "address_line1" => "a street address",
    "city" => "a city",
    "country" => "a country",
    "postal_code" => "a postcode"
  }.freeze

  belongs_to :user
  belongs_to :shop_item, optional: true
  belongs_to :reviewer, class_name: "User", optional: true
  belongs_to :claimed_by, class_name: "User", optional: true
  belongs_to :fulfilled_by, class_name: "User", optional: true
  belongs_to :fraud_related_project, class_name: "Project", optional: true

  encrypts :frozen_address

  enum :kind, { item: 0, grant: 1 }
  enum :state, { pending: 0, approved: 1, on_hold: 2, rejected: 3, fulfilled: 4, refunded: 5 }

  validates :quantity, numericality: { only_integer: true, greater_than: 0 }
  validates :frozen_coin_cost, numericality: { only_integer: true, greater_than: 0 }
  validates :frozen_item_name, presence: true
  validates :rejection_reason, presence: true, if: :rejected?
  validates :hcb_grant_link, format: { with: %r{\Ahttps://[^\s]+\z}i }, allow_blank: true

  scope :held, -> { where(state: HELD_STATES) }
  scope :awaiting_fulfillment, -> { where(state: :approved) }
  scope :open_orders, -> { where(state: %i[pending on_hold]) }
  scope :recent, -> { order(created_at: :desc) }
  scope :unclaimed_or_claimed_by, ->(user) {
    where("claimed_by_id IS NULL OR claimed_at IS NULL OR claimed_at < ? OR claimed_by_id = ?", CLAIM_TTL.ago, user.id)
  }

  def self.place!(user:, shop_item:, quantity: 1)
    region = ShopItem.region_for(user)
    cost = shop_item.coin_cost_for(region)
    refusal = refusal_for(user: user, shop_item: shop_item, quantity: quantity, cost: cost)
    raise NotAllowed, refusal if refusal

    create!(
      user: user,
      shop_item: shop_item,
      kind: shop_item.grant? ? :grant : :item,
      quantity: quantity,
      region: region,
      frozen_coin_cost: cost,
      frozen_item_name: shop_item.name,
      frozen_address: shop_item.physical? ? address_json(user) : nil,
      amount_usd: shop_item.grant_amount_usd
    )
  end

  def self.refusal_for(user:, shop_item:, quantity:, cost: nil)
    cost ||= shop_item.coin_cost_for(ShopItem.region_for(user))
    total = cost * quantity

    return "Your account is suspended, so nothing can be ordered." if user.is_banned?
    return "Order at least one." if quantity < 1
    if shop_item.max_quantity.present? && quantity > shop_item.max_quantity
      return "You can order at most #{shop_item.max_quantity} of these at a time."
    end

    reason = shop_item.unavailable_reason(user, approved_minutes: user.approved_minutes, balance: user.spendable_coins)
    return reason if reason

    return "You have already claimed this one." if already_claimed?(user, shop_item)
    return "Only #{shop_item.available_stock} left." if shop_item.short_of?(quantity)

    missing = shop_item.physical? ? missing_address(user) : []
    return "We need #{missing.to_sentence} on file before this can ship." if missing.any?

    return "That costs #{total} coins and you have #{user.spendable_coins}." if total > user.spendable_coins

    nil
  end

  def self.already_claimed?(user, shop_item)
    return false unless shop_item.one_per_person?

    where(user: user, shop_item: shop_item).where.not(state: %i[rejected refunded]).exists?
  end

  def self.missing_address(user)
    REQUIRED_ADDRESS_FIELDS.filter_map { |field, label| label if user.public_send(field).blank? }
  end

  def self.address_json(user)
    JSON.generate(ADDRESS_FIELDS.index_with { |field| user.public_send(field) })
  end

  def self.atomic_claim!(id, user)
    now = Time.current
    updated = open_orders.where(id: id)
      .where("claimed_by_id IS NULL OR claimed_at IS NULL OR claimed_at < ? OR claimed_by_id = ?", now - CLAIM_TTL, user.id)
      .update_all(claimed_by_id: user.id, claimed_at: now, updated_at: now)

    updated.zero? ? nil : find(id)
  end

  def address
    return {} if frozen_address.blank?

    JSON.parse(frozen_address).compact_blank
  rescue JSON::ParserError
    {}
  end

  def address_lines
    address.values_at(*ADDRESS_FIELDS).compact_blank
  end

  def total_coins
    frozen_coin_cost * quantity
  end

  def held?
    state.in?(HELD_STATES)
  end

  def decidable?
    pending? || on_hold?
  end

  def claimed_by?(user)
    claimed_by_id == user.id && claimed_at.present? && claimed_at > CLAIM_TTL.ago
  end

  def approve!(actor, notes: nil)
    update!(state: :approved, reviewer: actor, reviewed_at: Time.current, review_notes: notes.presence)
  end

  def hold!(actor, notes: nil)
    update!(state: :on_hold, reviewer: actor, reviewed_at: Time.current, review_notes: notes.presence)
  end

  def reject!(actor, reason:, fraud_project: nil)
    update!(
      state: :rejected,
      reviewer: actor,
      reviewed_at: Time.current,
      rejection_reason: reason,
      fraud_related_project: fraud_project
    )
  end

  def fulfill!(actor, reference: nil)
    raise NotAllowed, "#{frozen_item_name} is not waiting to be sent." unless approved?

    reference = reference.to_s.strip.presence
    attributes = { state: :fulfilled, fulfilled_by: actor, fulfilled_at: Time.current }
    attributes[grant? ? :hcb_grant_link : :tracking_number] = reference if reference

    update!(attributes)
  end

  def refund!(actor, reason:)
    update!(state: :refunded, reviewer: actor, reviewed_at: Time.current, review_notes: reason)
  end
end
