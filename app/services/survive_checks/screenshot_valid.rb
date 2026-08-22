module SurviveChecks
  class ScreenshotValid < Base
    STILL_TYPES = %w[image/png image/jpeg image/webp].freeze

    def self.label
      "Screenshot"
    end

    def call
      banner = project.banner
      return fail!("There is no screenshot yet. Upload one that shows the project working.") unless banner.attached?

      type = banner.content_type
      return fail!("The screenshot is animated. The grant record needs a still image, so use a PNG, JPEG or WEBP.") if type == "image/gif"
      return fail!("The screenshot is a #{type}, which is not an image we can send on.") unless STILL_TYPES.include?(type)

      pass("A #{type} screenshot is attached.")
    end
  end
end
