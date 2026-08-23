require "active_storage/service/s3_service"

module ActiveStorageR2
  class NotConfigured < StandardError; end

  ENV_VARS = %w[R2_ENDPOINT R2_BUCKET R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY].freeze

  def initialize(public_host: nil, **options)
    if options[:bucket].blank?
      missing = ENV_VARS.select { |name| ENV[name].blank? }
      raise NotConfigured, "Active Storage is set to R2 but #{missing.to_sentence} " \
        "#{missing.one? ? 'is' : 'are'} not set. Set #{missing.one? ? 'it' : 'them'} " \
        "on the container, or point config.active_storage.service at :local."
    end

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
