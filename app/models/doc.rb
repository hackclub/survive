class Doc < ApplicationRecord
  belongs_to :updated_by, class_name: "User", optional: true

  validates :title, :slug, presence: true
  validates :slug, uniqueness: true

  scope :published, -> { where(published: true).order(:position, :id) }
  scope :ordered, -> { order(:position, :id) }

  before_validation :normalize_slug

  def as_client_json
    {
      id: id,
      title: title,
      slug: slug,
      body: body,
      position: position,
      published: published,
      updatedAt: updated_at&.iso8601
    }
  end

  private

  def normalize_slug
    self.slug = title.to_s.parameterize if slug.blank?
  end
end
