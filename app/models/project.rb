class Project < ApplicationRecord
  belongs_to :user
  has_many :hackatime_projects, dependent: :nullify
  has_many :project_events, dependent: :destroy

  enum :status, { draft: 0, pending: 1, approved: 2, rejected: 3 }

  validates :name, presence: true
  validates :repo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :demo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :repo_link, :demo_link, presence: true, unless: :draft?
  validate :hackatime_project_linked, unless: :draft?

  scope :reviewable, -> { where(status: :pending) }

  def submit!
    transaction do
      update!(status: :pending)
      project_events.create!(actor: user, action: :submitted)
    end
  end

  def approve!(actor)
    transaction do
      update!(status: :approved)
      project_events.create!(actor: actor, action: :approved)
    end
  end

  def reject!(actor, feedback:)
    transaction do
      update!(status: :rejected)
      project_events.create!(actor: actor, action: :rejected, feedback: feedback)
    end
  end

  def as_client_json
    {
      id: id,
      name: name,
      description: description,
      status: status,
      repoLink: repo_link,
      demoLink: demo_link,
      updatedAt: updated_at.strftime("%b %d, %Y"),
      reviewFeedback: rejected? ? project_events.rejected.first&.feedback : nil
    }
  end

  private

  def hackatime_project_linked
    return if hackatime_projects.exists?

    errors.add(:base, "Link a Hackatime project before submitting for review")
  end
end
