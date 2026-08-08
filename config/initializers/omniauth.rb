OmniAuth::Strategies::OAuth2.class_eval do
  def callback_url
    full_host + callback_path
  end
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :oauth2,
    ENV.fetch("HCA_CLIENT_ID", nil),
    ENV.fetch("HCA_CLIENT_SECRET", nil),
    name: :hack_club,
    scope: HcaService.scopes,
    client_options: {
      site: HcaService.host,
      authorize_url: "/oauth/authorize",
      token_url: "/oauth/token"
    }

  provider :oauth2,
    ENV.fetch("HACKATIME_CLIENT_ID", nil),
    ENV.fetch("HACKATIME_CLIENT_SECRET", nil),
    name: :hackatime,
    scope: "profile read",
    client_options: {
      site: "https://hackatime.hackclub.com",
      authorize_url: "/oauth/authorize",
      token_url: "/oauth/token"
    }
end
