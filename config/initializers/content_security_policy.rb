# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self, :https
    policy.font_src    :self, :https, :data, "https://fonts.gstatic.com", "https://assets.hackclub.com"
    policy.img_src     :self, :https, :data, :blob, "https://cachet.hackclub.com"
    policy.object_src  :none
    policy.script_src  :self, :https
    policy.connect_src :self, :https
    # Allow @vite/client to hot reload javascript changes in development
    if Rails.env.development?
      vite_host = ViteRuby.config.host_with_port
      policy.script_src *policy.script_src, :unsafe_eval, :unsafe_inline, "http://#{vite_host}"
      policy.connect_src *policy.connect_src, "http://#{vite_host}", "ws://#{vite_host}"
      policy.img_src *policy.img_src, "http://#{vite_host}"
      policy.font_src *policy.font_src, "http://#{vite_host}"
    end

    # You may need to enable this in production as well depending on your setup.
    policy.script_src *policy.script_src, :blob if Rails.env.test?

    policy.style_src :self, :https, :unsafe_inline, "https://fonts.googleapis.com"
    # Allow @vite/client to hot reload style changes in development
    policy.style_src *policy.style_src, :unsafe_inline, "http://#{ViteRuby.config.host_with_port}" if Rails.env.development?

    # Specify URI for violation reports
    # policy.report_uri "/csp-violation-report-endpoint"
  end

  config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.base64(16) }
  config.content_security_policy_nonce_directives = %w[script-src]

  # Report violations without enforcing the policy while we confirm the allowlist is complete.
  # config.content_security_policy_report_only = true
end
