class Review < ApplicationRecord
  STUCK_AFTER = 48.hours

  belongs_to :project
  belongs_to :reviewer, class_name: "User", optional: true

  enum :state, { pending: 0, in_review: 1, approved: 2, rejected: 3, returned: 4, withdrawn: 5 }

  WITHDRAWABLE_PHASES = %w[processing review under_review second_pass].freeze

  after_save :sync_project_status, if: :saved_change_to_state?

  validates :round, numericality: { only_integer: true, greater_than: 0 }
  validates :round, uniqueness: { scope: :project_id }
  validates :ingest_version, numericality: { only_integer: true, greater_than: 0 }
  validates :approved_minutes, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true

  scope :open_rounds, -> { where(state: %i[pending in_review]) }
  scope :awaiting_ari, -> { open_rounds.where.not(ingested_at: nil) }
  scope :ingest_failed, -> { where(ingested_at: nil).where.not(ingest_error: nil) }
  scope :awaiting_ingest, -> { where(ingested_at: nil, ingest_error: nil) }
  scope :stuck, -> { awaiting_ari.where(ingested_at: ...STUCK_AFTER.ago) }
  scope :in_phase, ->(phase) { where(ari_phase: phase) }

  def decided?
    approved? || rejected? || returned?
  end

  def sync_project_status
    project.sync_status_from_reviews!
  end

  def ingested?
    ingested_at.present?
  end

  def withdrawable?
    ingested? && !decided? && !withdrawn? && (ari_phase.blank? || ari_phase.in?(WITHDRAWABLE_PHASES))
  end

  def withdraw!(reason)
    transaction do
      update!(state: :withdrawn, ari_phase: "withdrawn", maker_feedback: reason)
      project.returned_event!(reason)
    end
  end
end
