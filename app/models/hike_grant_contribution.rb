# Wood someone has put toward a hike. Anyone who can see a hike can chip in while it's waiting
# for review or after approval while it is being funded. It is held until the hike is rejected
# (when it is returned) or paid for.
class HikeGrantContribution < ApplicationRecord
  belongs_to :hike_grant
  belongs_to :user

  validates :wood, numericality: { only_integer: true, greater_than: 0 }

  scope :holding_wood, -> { joins(:hike_grant).where(hike_grants: { status: HikeGrant::WOOD_STATUSES }) }
end
