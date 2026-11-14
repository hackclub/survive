class HikeGrantParticipant < ApplicationRecord
  belongs_to :hike_grant
  belongs_to :user

  enum :status, { allocated: 0, issued: 1, cancelled: 2 }
  enum :membership_status, { pending: 0, approved: 1, declined: 2, left: 3 }, prefix: :membership

  validates :allocation_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :wood_cost, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :allocation_cents, numericality: { greater_than: 0 }, if: :membership_approved?

  validates :user_id, uniqueness: { scope: :hike_grant_id }
  validates :hcb_grant_url, format: { with: %r{\Ahttps://[^\s]+\z}i }, allow_blank: true

  scope :going, -> { where(membership_status: :approved) }
  scope :join_requests, -> { where(membership_status: :pending) }

  def mark_issued!(reference: nil)
    raise ArgumentError, "The hike grant must be approved first." unless hike_grant.approved? || hike_grant.paid?
    raise ArgumentError, "This hiker's place must be approved first." unless membership_approved?
    raise ArgumentError, "The hike must be fully funded before HCB funding is issued." unless hike_grant.funded?

    update!(status: :issued, hcb_grant_id: reference.to_s.strip.presence, issued_at: Time.current)
    hike_grant.refresh_payment_status!
  end
end
