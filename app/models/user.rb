class User < ApplicationRecord
  class AuthenticationError < StandardError; end

  ROLES = %w[reviewer fraud fulfiller admin superadmin].freeze

  encrypts :hca_token
  encrypts :hackatime_token

  has_many :projects, dependent: :destroy
  has_many :hackatime_projects, dependent: :destroy
  has_many :coin_payouts, dependent: :destroy
  has_many :coin_adjustments, dependent: :destroy
  has_many :orders, dependent: :destroy
  belongs_to :banned_by, class_name: "User", optional: true

  after_commit -> { Rails.cache.delete("user/#{id}") }

  validates :hca_id, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :display_name, presence: true
  validate :roles_are_known
  validates :banned_reason, presence: true, if: :is_banned?

  def self.exchange_hca_token(access_token)
    raise AuthenticationError, "No access token from HCA" if access_token.blank?

    hca_response = HcaService.me(access_token)
    raise AuthenticationError, "Failed to fetch user identity from HCA" unless hca_response

    identity = hca_response["identity"]
    raise AuthenticationError, "No identity data in HCA response" unless identity

    if ysws_ineligible?(identity)
      raise AuthenticationError, "Sorry, Survive is for YSWS-eligible teen builders. You're not eligible to participate."
    end

    user = find_by(hca_id: identity["id"])

    if user.present?
      user.update!(hca_token: access_token, email: identity["primary_email"])
      user.apply_hca_identity(identity)
      return user
    end

    user = create_from_hca(identity, access_token)
    user.apply_hca_identity(identity)
    user
  end

  def self.ysws_ineligible?(identity)
    status = identity["verification_status"].to_s
    return true if status == "ineligible"

    status == "verified" && identity["ysws_eligible"] != true
  end

  def self.determine_is_adult(identity)
    birthday_str = identity["birthday"]
    return false if birthday_str.blank?

    birthday = Date.parse(birthday_str)
    ((Date.today - birthday.to_date) / 365.25) >= 19
  rescue ArgumentError
    false
  end

  def self.create_from_hca(identity, access_token)
    email = identity["primary_email"]
    unless email.present? && email.match?(URI::MailTo::EMAIL_REGEXP)
      raise AuthenticationError, "HCA user has an invalid email: #{email.inspect}"
    end

    first_name = identity["first_name"] || ""
    last_name = identity["last_name"] || ""

    create!(
      email: email,
      display_name: first_name.presence || identity["id"] || "User",
      first_name: first_name.presence,
      last_name: last_name.presence,
      slack_id: identity["slack_id"] || "",
      verification_status: identity["verification_status"] || "",
      hca_token: access_token,
      hca_id: identity["id"],
      is_adult: determine_is_adult(identity),
      is_banned: false
    )
  end

  def apply_hca_identity(identity)
    return if identity.blank?

    addr = Array(identity["addresses"]).first
    addr = identity["address"] if addr.blank? && identity["address"].is_a?(Hash)
    addr ||= {}

    birthday_val = Date.parse(identity["birthday"].to_s) rescue nil

    attrs = {
      address_line1: pick(addr, %w[line_1 address_line_1 address_line1 line1 street]).presence,
      address_line2: pick(addr, %w[line_2 address_line_2 address_line2 line2]).presence,
      city: pick(addr, %w[city locality]).presence,
      state: pick(addr, %w[state state_province province region]).presence,
      country: pick(addr, %w[country country_code]).presence,
      postal_code: pick(addr, %w[postal_code zip zip_code postcode]).presence,
      phone_number: pick(identity, %w[phone_number phone]).presence || pick(addr, %w[phone_number phone]).presence,
      birthday: birthday_val
    }.compact

    update!(attrs) if attrs.any?
  end

  def ban!(actor, reason:)
    transaction do
      update!(is_banned: true, banned_at: Time.current, banned_by: actor, banned_reason: reason)
      orders.where(state: %i[pending approved]).find_each { |order| order.hold!(actor, notes: "Maker banned: #{reason}") }
    end
  end

  def unban!
    update!(is_banned: false, banned_at: nil, banned_by: nil, banned_reason: nil)
  end

  def coins_earned
    coin_payouts.sum(:coins)
  end

  def coins_adjusted
    coin_adjustments.sum(:amount)
  end

  def coins_held
    orders.held.sum("frozen_coin_cost * quantity")
  end

  def approved_minutes
    approved = Review.approved.joins(:project).where(projects: { user_id: id }).sum(:approved_minutes)
    deducted = FinalReview.deducted.joins(review: :project).where(projects: { user_id: id }).sum(:deduction_minutes)

    [ approved - deducted, 0 ].max
  end

  def coin_balance
    coins_earned + coins_adjusted - coins_held
  end

  def spendable_coins
    return 0 if is_banned?

    [ coin_balance, 0 ].max
  end

  def avatar_url
    CachetService.avatar_url(slack_id)
  end

  def review_display_name
    CachetService.fetch_display_name(slack_id) || "Member ##{id}"
  end

  def reviewer?
    roles.include?("reviewer") || admin?
  end

  def fraud?
    roles.include?("fraud") || admin?
  end

  def fulfiller?
    roles.include?("fulfiller") || admin?
  end

  def admin?
    roles.include?("admin") || superadmin?
  end

  def superadmin?
    roles.include?("superadmin")
  end

  private

  def roles_are_known
    unknown = roles - ROLES
    return if unknown.empty?

    errors.add(:roles, "contains unknown values: #{unknown.join(", ")}")
  end

  def pick(hash, keys)
    return "" unless hash.is_a?(Hash)

    keys.each do |k|
      value = hash[k] || hash[k.to_sym]
      return value.to_s if value.present?
    end

    ""
  end
end
