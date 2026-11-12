class ShopItem < ApplicationRecord
  DEFAULT_REGION = "default".freeze

  has_one_attached :image do |attachable|
    attachable.variant :card, resize_to_limit: [ 1200, 900 ], format: :webp, saver: { quality: 80 }, preprocessed: true
  end
  has_many :shop_item_regions, dependent: :destroy
  has_many :orders, dependent: :nullify

  accepts_nested_attributes_for :shop_item_regions, allow_destroy: true

  enum :kind, { physical: 0, digital: 1, grant: 2 }

  validates :name, presence: true
  validates :coin_cost, numericality: { only_integer: true, greater_than: 0 }
  validates :max_quantity, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :stock, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :min_approved_hours, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :grant_amount_usd, numericality: { greater_than: 0 }, allow_nil: true

  scope :enabled, -> { where(enabled: true) }
  scope :sorted, -> { order(featured: :desc, coin_cost: :asc, name: :asc) }

  def self.region_for(user)
    user.country.to_s.strip.downcase.presence || DEFAULT_REGION
  end

  def region_row(region)
    shop_item_regions.find { |row| row.region.to_s.casecmp?(region.to_s) }
  end

  def coin_cost_for(region)
    region_row(region)&.coin_cost || coin_cost
  end

  def enabled_for?(region)
    return false unless enabled?

    row = region_row(region)
    row.nil? || row.enabled?
  end

  def unlimited_stock?
    stock.nil?
  end

  def reserved_quantity
    orders.held.sum(:quantity)
  end

  def available_stock(reserved_quantity: nil)
    return nil if unlimited_stock?

    reserved = reserved_quantity.nil? ? self.reserved_quantity : reserved_quantity
    [ stock.to_i - reserved, 0 ].max
  end

  def short_of?(quantity)
    !unlimited_stock? && quantity > available_stock
  end

  def in_stock?(reserved_quantity: nil)
    unlimited_stock? || available_stock(reserved_quantity: reserved_quantity).positive?
  end

  def unlock_minutes
    min_approved_hours.to_i * 60
  end

  def unavailable_reason(user, approved_minutes:, balance:, reserved_quantity: nil)
    region = self.class.region_for(user)

    return "Not available where you are" unless enabled_for?(region)
    return "Out of stock" unless in_stock?(reserved_quantity: reserved_quantity)
    return "Unlocks at #{min_approved_hours} approved hours" if min_approved_hours.present? && approved_minutes < unlock_minutes

    cost = coin_cost_for(region)
    return "Needs #{cost - balance} more wood" if balance < cost

    nil
  end

  def image_url
    ImageUrl.for(image, :card)
  end
end
