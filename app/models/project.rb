class Project < ApplicationRecord
  class NotReadyToSubmit < StandardError
    attr_reader :failures

    def initialize(failures)
      @failures = failures
      super(reasons.join(" "))
    end

    def reasons
      failures.map { |failure| failure["reasoning"] }
    end
  end

  belongs_to :user
  has_many :hackatime_projects, dependent: :nullify
  has_many :project_events, dependent: :destroy
  has_many :reviews, -> { order(:round) }, inverse_of: :project, dependent: :destroy
  has_one_attached :banner do |attachable|
    # Banners can be 5 MB originals. Pages show this resized copy, made in a background job on upload.
    attachable.variant :card, resize_to_limit: [ 1200, 900 ], format: :webp, saver: { quality: 80 }, preprocessed: true
  end

  BANNER_CONTENT_TYPES = %w[image/png image/jpeg image/webp image/gif].freeze
  BANNER_MAX_SIZE = 5.megabytes

  enum :status, { draft: 0, pending: 1, approved: 2, rejected: 3, returned: 4 }

  STATUS_FOR_REVIEW_STATE = {
    "pending" => :pending,
    "in_review" => :pending,
    "approved" => :approved,
    "rejected" => :rejected,
    "returned" => :returned,
    "withdrawn" => :returned
  }.freeze

  validates :name, presence: true
  validates :repo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :demo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :repo_link, :demo_link, presence: true, unless: :draft?
  validate :hackatime_project_linked, unless: :draft?
  validate :banner_attached, unless: :draft?
  validate :banner_is_valid_image, if: -> { banner.attached? }

  before_save :set_normalized_repo_url, if: :will_save_change_to_repo_link?

  def submit!
    unless hackatime_projects.exists?
      raise NotReadyToSubmit, [{ "reasoning" => "Link a Hackatime project before submitting for review." }]
    end

    result = SurviveCheckService.run(project: self)
    raise NotReadyToSubmit, result["blocking"] if result["blocking"].any?

    review = transaction do
      project_events.create!(actor: user, action: :submitted)
      opened = record_checks(result)
      sync_status_from_reviews!
      opened
    end

    AriIngestJob.perform_later(review.id)
    review
  end

  def sync_status_from_reviews!
    review = reviews.reload.reorder(round: :desc).first
    return if review.nil?

    derived = STATUS_FOR_REVIEW_STATE.fetch(review.state)
    return if status == derived.to_s

    update_column(:status, self.class.statuses.fetch(derived.to_s))
  end

  def record_event(action, feedback)
    project_events.create!(actor: user, action: action, feedback: feedback.presence || "Decided by the review team.")
  end

  def record_checks(result)
    review = open_review
    return reviews.create!(round: next_round, checks: result, checks_run_at: Time.current) if review.nil?

    attributes = { checks: result, checks_run_at: Time.current }
    attributes[:ingest_version] = review.ingest_version + 1 if review.ingested?
    review.update!(attributes)
    review
  end

  def open_review
    reviews.open_rounds.reorder(round: :desc).first
  end

  def latest_review
    reviews.loaded? ? reviews.max_by(&:round) : reviews.reorder(round: :desc).first
  end

  def ari_external_id
    "survive-#{id}"
  end

  def next_round
    (reviews.maximum(:round) || 0) + 1
  end

  def approved_event!(feedback)
    record_event(:approved, feedback)
  end

  def rejected_event!(feedback)
    record_event(:rejected, feedback)
  end

  def returned_event!(feedback)
    record_event(:returned, feedback)
  end

  def reverted_event!(reason)
    project_events.create!(actor: user, action: :reverted, feedback: reason)
  end

  def banner_url
    return nil unless banner.attached?

    card = banner.variant(:card)
    # Once the resized copy exists on a public bucket, link straight to it so the browser
    # never has to go through Rails. Until then Rails makes it on first request and redirects.
    return card.url if card.key.present? && banner.blob.service.public?

    Rails.application.routes.url_helpers.rails_representation_path(card, only_path: true)
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
      round: latest_review&.round,
      reviewState: latest_review&.state,
      approvedMinutes: latest_review&.approved_minutes,
      reviewFeedback: latest_review&.decided? ? latest_review.maker_feedback : nil,
      trailStage: trail_stage,
      trailNote: trail_note,
      paidCoins: latest_review&.coin_payout&.coins
    }
  end

  def trail_stage
    review = latest_review
    return "draft" if review.nil?
    return "changes" if review.returned?
    return "rejected" if review.rejected?
    return "approved" if review.approved? && review.coin_payout.present?

    "sent"
  end

  def trail_note
    review = latest_review
    return nil if review.nil?

    case trail_stage
    when "sent" then "Sent for review #{review.created_at.strftime('%A %-d %B')}. Nothing is needed from you."
    else nil
    end
  end

  private

  def set_normalized_repo_url
    self.normalized_repo_url = RepoUrl.normalize(repo_link)
  end

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
