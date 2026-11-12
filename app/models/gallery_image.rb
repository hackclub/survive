class GalleryImage < ApplicationRecord
  belongs_to :created_by, class_name: "User"
  has_one_attached :image do |attachable|
    attachable.variant :carousel, resize_to_limit: [ 1800, 1100 ], format: :webp, saver: { quality: 82 }, preprocessed: true
  end

  enum :placement, { landing: "landing", hikes: "hikes", both: "both" }

  validates :image, presence: true
  validates :placement, inclusion: { in: placements.keys }

  scope :ordered, -> { order(position: :asc, created_at: :desc) }

  def image_url
    ImageUrl.for(image, :carousel)
  end
end
