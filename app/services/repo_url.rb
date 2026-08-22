module RepoUrl
  module_function

  def normalize(url)
    return nil if url.blank?

    uri = URI.parse(url.to_s.strip)
    return nil if uri.host.blank?

    host = uri.host.downcase.delete_prefix("www.")
    path = uri.path.to_s.chomp("/").delete_suffix(".git").downcase
    return nil if path.blank? || path == "/"

    "#{host}#{path}"
  rescue URI::InvalidURIError
    nil
  end
end
