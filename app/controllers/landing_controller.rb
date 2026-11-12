class LandingController < ApplicationController
  allow_unauthenticated_access only: %i[index]

  def index
    return redirect_to(dashboard_path) if current_user

    render inertia: "Landing/Index", props: { galleryImages: GalleryImage.where(placement: %w[landing both]).with_attached_image.ordered.map { |image| { id: image.id, imageUrl: image.image_url, caption: image.caption } } }
  end
end
