require "resolv"
require "ipaddr"

module SafeHttp
  module_function

  GIT_HOSTS = %w[
    github.com www.github.com
    gitlab.com www.gitlab.com
    codeberg.org
    bitbucket.org
    git.sr.ht
  ].freeze

  OPEN_TIMEOUT = 3
  READ_TIMEOUT = 5

  RESERVED_RANGES = [
    IPAddr.new("0.0.0.0/8"),
    IPAddr.new("100.64.0.0/10"),
    IPAddr.new("192.0.0.0/24"),
    IPAddr.new("192.0.2.0/24"),
    IPAddr.new("198.18.0.0/15"),
    IPAddr.new("198.51.100.0/24"),
    IPAddr.new("203.0.113.0/24"),
    IPAddr.new("224.0.0.0/4"),
    IPAddr.new("240.0.0.0/4"),
    IPAddr.new("::/128"),
    IPAddr.new("64:ff9b::/96"),
    IPAddr.new("100::/64"),
    IPAddr.new("2001:db8::/32"),
    IPAddr.new("ff00::/8")
  ].freeze

  Outcome = Struct.new(:reachable, :status, :blocked_reason, :error, keyword_init: true) do
    def blocked?
      blocked_reason.present?
    end
  end

  def reach(url, allowed_hosts:)
    uri = parse(url)
    return Outcome.new(reachable: false, blocked_reason: "that is not a valid https link") if uri.nil?

    unless allowed_hosts.include?(uri.host.to_s.downcase)
      return Outcome.new(reachable: false, blocked_reason: "#{uri.host} is not a git host we recognise")
    end

    unless publicly_routable?(uri.host)
      return Outcome.new(reachable: false, blocked_reason: "#{uri.host} does not resolve to a public address")
    end

    response = connection.head(uri.to_s)
    Outcome.new(reachable: response.success?, status: response.status)
  rescue Faraday::Error => e
    Outcome.new(reachable: false, error: e.class.name.demodulize)
  end

  def parse(url)
    return nil if url.blank?

    uri = URI.parse(url.to_s.strip)
    return nil unless uri.is_a?(URI::HTTPS)
    return nil if uri.host.blank?

    uri
  rescue URI::InvalidURIError
    nil
  end

  def publicly_routable?(host)
    addresses = Resolv.getaddresses(host)
    return false if addresses.empty?

    addresses.all? { |address| public_address?(address) }
  rescue Resolv::ResolvError, Resolv::ResolvTimeout
    false
  end

  def public_address?(address)
    ip = IPAddr.new(address)
    return false if ip.loopback? || ip.private? || ip.link_local?

    RESERVED_RANGES.none? { |range| range.include?(ip) }
  rescue IPAddr::Error
    false
  end

  def connection
    @connection ||= Faraday.new do |f|
      f.options.open_timeout = OPEN_TIMEOUT
      f.options.timeout = READ_TIMEOUT
      f.adapter Faraday.default_adapter
    end
  end
end
