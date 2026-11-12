module Airtable
  # Maps an approved review onto the Hack Club YSWS "Project Submission" template.
  # Only writable input fields belong here: never formula, "Automation - *" or "Loops - *" fields.
  class Submission
    ARI_APP_URL = "https://ari.hackclub.com".freeze
    TEST_BANNER = "TEST SUBMISSION, not a real project. Do not submit to Unified YSWS; delete this row after checking.".freeze

    def self.fields(review)
      new(review).fields
    end

    attr_reader :review, :project, :maker

    def initialize(review)
      @review = review
      @project = review.project
      @maker = @project.user
    end

    def fields
      {
        "Code URL" => project.repo_link,
        "Playable URL" => project.demo_link,
        "First Name" => maker.first_name,
        "Last Name" => maker.last_name,
        "Email" => maker.email,
        "Screenshot" => screenshot,
        "Description" => description,
        "GitHub Username" => github_username,
        "Address (Line 1)" => maker.address_line1,
        "Address (Line 2)" => maker.address_line2,
        "City" => maker.city,
        "State / Province" => maker.state,
        "Country" => maker.country,
        "ZIP / Postal Code" => maker.postal_code,
        "Birthday" => maker.birthday&.iso8601,
        "Optional - Override Hours Spent" => hours,
        "Optional - Override Hours Spent Justification" => hours_justification,
        "Justification - Hackatime Project Name(s) + Date Range(s)" => hackatime_justification,
        "Justification - Submitter Hackatime ID" => maker.hackatime_uid
      }.compact_blank
    end

    def hours
      minutes = review.net_approved_minutes
      minutes && (minutes / 60.0).round(2)
    end

    private

    def description
      text = project.description.to_s.strip
      review.test_submission? ? "[#{TEST_BANNER}]\n\n#{text}" : text
    end

    def screenshot
      url = PublicUrl.for_attachment(project.banner)
      url ? [ { "url" => url } ] : nil
    end

    def github_username
      match = project.repo_link.to_s.match(%r{\Ahttps?://(?:www\.)?github\.com/([A-Za-z0-9-]+)(?:/|\z)}i)
      match && match[1]
    end

    def hackatime_names
      project.hackatime_projects.order(:name).pluck(:name)
    end

    def hackatime_justification
      names = hackatime_names
      return nil if names.empty?

      approved_on = (review.decided_at || Time.current).to_date
      "#{names.join(', ')} (tracked #{project.created_at.to_date.iso8601} to #{approved_on.iso8601})"
    end

    def hours_justification
      return nil if hours.nil?

      lines = []
      lines << TEST_BANNER if review.test_submission?
      lines << "Approved in Ari by #{reviewer} for #{format('%.2f', hours)} hours" \
        "#{" (#{review.round.ordinalize} ship)" if review.round > 1}."
      names = hackatime_names
      lines << "Hackatime project#{'s' unless names.one?}: #{names.join(', ')}." if names.any?
      if review.final_review&.deducted?
        lines << "Includes a #{review.final_review.deduction_minutes} minute deduction from final review."
      end
      lines << "Ari review: #{ari_link}" if ari_link
      lines.join("\n")
    end

    def reviewer
      review.ari_reviewer_email.presence ||
        (review.ari_reviewer_slack_id.present? ? "Slack #{review.ari_reviewer_slack_id}" : "the Ari review team")
    end

    def ari_link
      program = Ari::Config.program_id
      return nil if program.blank?

      link = "#{ARI_APP_URL}/p/#{program}"
      review.ari_ship_id.present? ? "#{link} (ship #{review.ari_ship_id})" : link
    end
  end
end
