require "active_storage/service/s3_service"

module ActiveStorageR2
  def initialize(public_host: nil, **options)
    @public_host = public_host.presence
    super(**options)
    @upload_options.delete(:acl) if @public_host
  end

  private

  def public_url(key, **client_opts)
    return super unless @public_host

    "https://#{@public_host}/#{key}"
  end
end

ActiveStorage::Service::S3Service.prepend(ActiveStorageR2)
