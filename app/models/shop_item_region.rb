class ShopItemRegion < ApplicationRecord
  belongs_to :shop_item

  validates :region, presence: true
  validates :region, uniqueness: { scope: :shop_item_id, case_sensitive: false }
  validates :coin_cost, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true

  before_validation { self.region = region.to_s.strip.downcase.presence }
end
