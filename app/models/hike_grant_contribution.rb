# Wood someone has put toward a hike. Anyone who can see a hike can chip in while it's waiting
# for review. It's held while the hike is pending, spent once it's approved, and handed back
# if the hike is rejected.
class HikeGrantContribution < ApplicationRecord
  belongs_to :hike_grant
  belongs_to :user

  validates :wood, numericality: { only_integer: true, greater_than: 0 }

  scope :holding_wood, -> { joins(:hike_grant).where(hike_grants: { status: HikeGrant::WOOD_STATUSES }) }
end
