module ImageUrl
  module_function

  # Where the browser should load an uploaded image from. On the public R2 bucket that is
  # always a direct link (the resized copy once it exists, the original until then), so
  # images never queue behind page requests in Rails or pay the password gate in front of it.
  # Elsewhere (local disk) Rails makes the resized copy on first request and redirects.
  def for(attachment, variant_name)
    return nil unless attachment.attached?

    variant = attachment.variant(variant_name)
    if attachment.blob.service.public?
      variant.key.present? ? variant.url : attachment.url
    else
      Rails.application.routes.url_helpers.rails_representation_path(variant, only_path: true)
    end
  end
end
