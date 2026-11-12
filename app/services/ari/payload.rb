module Ari
  class Payload
    REQUIRED = %w[external_id title description repo_url demo_url thumbnail_url].freeze
    REQUIRED_MAKER = %w[email name slack_id].freeze
    EVIDENCE = %w[commits elapsed].freeze
    TRACK = "software".freeze
    TEST_NOTE = "Admin test of the Ari to Airtable pipeline, not a real ship. Decide freely; it never pays wood.".freeze

    def self.build(review)
      new(review).build
    end

    attr_reader :review, :project, :maker

    def initialize(review)
      @review = review
      @project = review.project
      @maker = @project.user
    end

    def build
      payload = {
        "external_id" => project.ari_external_id,
        "ingest_version" => review.ingest_version,
        "title" => review.test_submission? ? "[TEST] #{project.name}" : project.name,
        "description" => project.description.to_s.strip,
        "maker" => maker_payload,
        "repo_url" => project.repo_link,
        "demo_url" => project.demo_link,
        "thumbnail_url" => PublicUrl.for_attachment(project.banner),
        "hackatime_projects" => hackatime_names,
        "evidence" => EVIDENCE,
        "track" => TRACK,
        "meta" => meta
      }
      payload["is_update"] = true if review.round > 1

      validate!(payload)
      payload
    end

    private

    def maker_payload
      payload = {
        "email" => maker.email,
        "name" => maker.display_name,
        "slack_id" => maker.slack_id.presence
      }
      payload["hackatime_id"] = maker.hackatime_uid if maker.hackatime_uid.present?
      payload
    end

    def hackatime_names
      project.hackatime_projects.order(:name).pluck(:name)
    end

    def meta
      page = PublicUrl.project(project)
      meta = page ? { "Project page" => page } : {}
      meta["Test submission"] = TEST_NOTE if review.test_submission?
      meta
    end

    def validate!(payload)
      missing = REQUIRED.reject { |field| payload[field].present? }
      missing += REQUIRED_MAKER.reject { |field| payload["maker"][field].present? }.map { |field| "maker.#{field}" }
      missing << "hackatime_projects" if payload["hackatime_projects"].empty?

      raise IncompletePayload, missing if missing.any?
    end
  end
end
