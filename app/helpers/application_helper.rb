module ApplicationHelper
  SCENE_PAGES = { "landing" => "index", "dashboard" => "index" }.freeze
  SCENE_LAYERS = %w[clouds mountains ground vegetation].freeze

  # The landing page and the dashboard hub are drawn from big image layers that the JS only
  # asks for once it has loaded. Preloading them from the HTML starts those downloads at once.
  def scene_preload_tags
    return unless SCENE_PAGES[controller_name] == action_name

    safe_join(SCENE_LAYERS.map { |layer|
      tag.link(rel: "preload", as: "image", type: "image/webp", fetchpriority: "high",
        href: vite_asset_path("images/#{layer}.webp"))
    }, "\n")
  end
end
