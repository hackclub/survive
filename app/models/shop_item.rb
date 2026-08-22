class ShopItem < ApplicationRecord
  DEFAULT_REGION = "default".freeze

  has_one_attached :image
  has_many :shop_item_regions, dependent: :destroy

  accepts_nested_attributes_for :shop_item_regions, allow_destroy: true

  enum :kind, { physical: 0, digital: 1, grant: 2 }

  validates :name, presence: true
  validates :coin_cost, numericality: { only_integer: true, greater_than: 0 }
  validates :max_quantity, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :stock, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :min_approved_hours, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :internal_price_usd, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  scope :enabled, -> { where(enabled: true) }
  scope :sorted, -> { order(:coin_cost, :name) }

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

  def in_stock?
    unlimited_stock? || stock.to_i.positive?
  end

  def unlock_minutes
    min_approved_hours.to_i * 60
  end

  def unavailable_reason(user, approved_minutes:, balance:)
    region = self.class.region_for(user)

    return "Not available where you are" unless enabled_for?(region)
    return "Out of stock" unless in_stock?
    return "Unlocks at #{min_approved_hours} approved hours" if min_approved_hours.present? && approved_minutes < unlock_minutes

    cost = coin_cost_for(region)
    return "Needs #{cost - balance} more coins" if balance < cost

    nil
  end

  def image_url
    return nil unless image.attached?

    Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true)
  end
end
