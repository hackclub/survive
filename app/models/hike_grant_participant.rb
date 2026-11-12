class HikeGrantParticipant < ApplicationRecord
  belongs_to :hike_grant
  belongs_to :user

  enum :status, { allocated: 0, issued: 1, cancelled: 2 }

  validates :allocation_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :wood_cost, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # Shares whose wood is held or spent: still on the hike, and the hike wasn't rejected.
  scope :holding_wood, -> {
    where(status: %i[allocated issued]).joins(:hike_grant).where(hike_grants: { status: HikeGrant::WOOD_STATUSES })
  }
  validates :user_id, uniqueness: { scope: :hike_grant_id }
  validates :hcb_grant_url, format: { with: %r{\Ahttps://[^\s]+\z}i }, allow_blank: true

  def mark_issued!(reference: nil)
    raise ArgumentError, "The hike grant must be approved first." unless hike_grant.approved? || hike_grant.paid?
    update!(status: :issued, hcb_grant_id: reference.to_s.strip.presence, issued_at: Time.current)
    hike_grant.refresh_payment_status!
  end
end
