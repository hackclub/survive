module SurviveChecks
  class DemoPresent < Base
    VIDEO_HOSTS = %w[
      youtube.com www.youtube.com youtu.be
      vimeo.com player.vimeo.com
      loom.com www.loom.com
      twitch.tv www.twitch.tv
      streamable.com
    ].freeze

    VIDEO_EXTENSIONS = %w[.mp4 .mov .webm .avi .mkv].freeze

    def self.label
      "Somewhere to run it"
    end

    def call
      url = project.demo_link
      return fail!("There is no playable link yet. Add somewhere a reviewer can actually run this.") if url.blank?

      uri = SafeHttp.parse(url)
      return fail!("The playable link is not a valid https link.") if uri.nil?
      return fail!("The playable link is a video of the project, not the project. Link something runnable.") if video?(uri)

      pass("Playable at #{uri.host}.")
    end

    private

    def video?(uri)
      return true if VIDEO_HOSTS.include?(uri.host.to_s.downcase)

      VIDEO_EXTENSIONS.any? { |extension| uri.path.to_s.downcase.end_with?(extension) }
    end
  end
end
