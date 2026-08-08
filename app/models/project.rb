class Project < ApplicationRecord
  belongs_to :user

  enum :status, { draft: 0, pending: 1, approved: 2, rejected: 3 }

  validates :name, presence: true
  validates :repo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :demo_link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true
  validates :repo_link, :demo_link, presence: true, unless: :draft?

  scope :reviewable, -> { where(status: :pending) }

  def submit!
    update!(status: :pending)
  end
end
