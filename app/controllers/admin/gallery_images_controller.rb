class Admin::GalleryImagesController < ApplicationController
  def index
    authorize HikeGrant, :manage?
    images = GalleryImage.includes(image_attachment: :blob).ordered
    render inertia: "Admin/GalleryImages/Index", props: {
      images: images.map { |image| serialize(image) }
    }
  end

  def create
    authorize HikeGrant, :manage?
    return redirect_to(admin_gallery_images_path, alert: "Choose an image to upload.") if params[:image].blank?

    image = GalleryImage.new(
      image: params[:image],
      caption: params[:caption].to_s.strip.presence,
      placement: params[:placement].presence_in(GalleryImage.placements.keys) || "both",
      created_by: current_user,
      position: GalleryImage.maximum(:position).to_i + 1
    )
    if image.save
      audit!("gallery_image.created", target: image, metadata: { placement: image.placement })
      redirect_to admin_gallery_images_path, notice: "Image added to the gallery."
    else
      redirect_to admin_gallery_images_path, alert: image.errors.full_messages.to_sentence
    end
  end

  def destroy
    authorize HikeGrant, :manage?
    image = GalleryImage.find(params[:id])
    image.destroy!
    audit!("gallery_image.deleted", metadata: { gallery_image_id: image.id })
    redirect_to admin_gallery_images_path, notice: "Gallery image deleted."
  end

  private

  def serialize(image)
    { id: image.id, caption: image.caption, placement: image.placement, imageUrl: image.image_url }
  end
end
