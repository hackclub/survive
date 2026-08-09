class Project < ApplicationRecord
  CLAIM_TTL = 20.minutes

  belongs_to :user
  belongs_to :claimed_by, class_name: "User", optional: true
  has_many :hackatime_projects, dependent: :nullify
  has_many :project_events, dependent: :destroy
  has_one_attached :banner

  BANNER_CONTENT_TYPES = %w[image/png image/jpeg image/webp image/gif].freeze
  BANNER_MAX_SIZE = 5.megabytes

  enum :status, { draft: 0, pending: 1, approved: 2, rejected: 3 }

  validates :name, presence: true
  validates :repo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :demo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :repo_link, :demo_link, presence: true, unless: :draft?
  validate :hackatime_project_linked, unless: :draft?
  validate :banner_attached, unless: :draft?
  validate :banner_is_valid_image, if: -> { banner.attached? }

  scope :reviewable, -> { where(status: :pending) }
  scope :unclaimed_or_claimed_by, ->(user) {
    where("claimed_by_id IS NULL OR claimed_at < ? OR claimed_by_id = ?", CLAIM_TTL.ago, user.id)
  }

  def self.atomic_claim!(id, user)
    now = Time.current
    updated = where(id: id)
      .where("claimed_by_id IS NULL OR claimed_at < ? OR claimed_by_id = ?", now - CLAIM_TTL, user.id)
      .update_all(claimed_by_id: user.id, claimed_at: now)

    return nil if updated.zero?

    find(id)
  end

  def unclaim!(user)
    self.class.where(id: id, claimed_by_id: user.id).update_all(claimed_by_id: nil, claimed_at: nil)
  end

  def claim_expired?
    claimed_at.nil? || claimed_at < CLAIM_TTL.ago
  end

  def claimed_by?(user)
    claimed_by_id == user.id && !claim_expired?
  end

  def claimed_by_someone_else?(user)
    claimed_by_id.present? && claimed_by_id != user.id && !claim_expired?
  end

  def submit!
    transaction do
      update!(status: :pending)
      project_events.create!(actor: user, action: :submitted)
    end
  end

  def approve!(actor, feedback:)
    transaction do
      update!(status: :approved)
      project_events.create!(actor: actor, action: :approved, feedback: feedback)
    end
  end

  def reject!(actor, feedback:)
    transaction do
      update!(status: :rejected)
      project_events.create!(actor: actor, action: :rejected, feedback: feedback)
    end
  end

  def banner_url
    return nil unless banner.attached?

    Rails.application.routes.url_helpers.rails_blob_path(banner, only_path: true)
  end

  def as_client_json
    {
      id: id,
      name: name,
      description: description,
      status: status,
      repoLink: repo_link,
      demoLink: demo_link,
      bannerUrl: banner_url,
      updatedAt: updated_at.strftime("%b %d, %Y"),
      reviewFeedback: (approved? || rejected?) ? project_events.where(action: %w[approved rejected]).first&.feedback : nil
    }
  end

  private

  def banner_attached
    return if banner.attached?

    errors.add(:banner, "must be uploaded before submitting for review")
  end

  def banner_is_valid_image
    unless banner.content_type.in?(BANNER_CONTENT_TYPES)
      errors.add(:banner, "must be a PNG, JPEG, WEBP, or GIF")
    end

    if banner.byte_size > BANNER_MAX_SIZE
      errors.add(:banner, "must be smaller than 5MB")
    end
  end

  def hackatime_project_linked
    return if hackatime_projects.exists?

    errors.add(:base, "Link a Hackatime project before submitting for review")
  end
end
