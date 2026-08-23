Rails.application.config.to_prepare do
  InertiaRails::Helper.prepend(Module.new do
    def inertia_root(id: nil, page: inertia_page)
      id ||= controller.send(:inertia_configuration).root_dom_id

      safe_join([
        tag.script(
          page.to_json.html_safe,
          "data-page": id,
          type: "application/json",
          nonce: content_security_policy_nonce
        ),
        tag.div(id: id)
      ], "\n")
    end
  end)
end
