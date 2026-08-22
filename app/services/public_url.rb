module PublicUrl
  module_function

  def configured?
    url_options[:host].present?
  end

  def root
    options = url_options
    return nil if options[:host].blank?

    port = options[:port] ? ":#{options[:port]}" : ""
    "#{options[:protocol]}://#{options[:host]}#{port}"
  end

  def project(project)
    base = root
    base && "#{base}/projects/#{project.id}"
  end

  def for_attachment(attachment)
    return nil if attachment.nil? || !attachment.attached?

    options = url_options
    if options[:host].blank?
      Rails.logger.error("[PublicUrl] no public host configured (asset_host or APP_HOST), attachment url skipped")
      return nil
    end

    Rails.application.routes.url_helpers.rails_storage_proxy_url(attachment, **options)
  rescue StandardError => e
    Rails.logger.error("[PublicUrl] could not build url for #{attachment.class}: #{e.class}: #{e.message}")
    nil
  end

  def url_options
    raw = Rails.application.config.asset_host.presence || ENV["APP_HOST"].presence
    return {} if raw.blank?

    raw = "https://#{raw}" unless raw.match?(%r{\Ahttps?://})
    uri = URI.parse(raw)
    options = { host: uri.host, protocol: uri.scheme }
    options[:port] = uri.port if uri.port && ![ 80, 443 ].include?(uri.port)
    options
  rescue URI::InvalidURIError => e
    Rails.logger.error("[PublicUrl] invalid asset_host or APP_HOST #{raw.inspect}: #{e.message}")
    {}
  end
end
