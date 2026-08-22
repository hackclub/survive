module SurviveChecks
  class Context
    attr_reader :project, :review

    def initialize(project:, review: nil)
      @project = project
      @review = review
    end

    def maker
      @maker ||= project.user
    end

    def hackatime_names
      @hackatime_names ||= project.hackatime_projects.order(:name).pluck(:name)
    end

    def seconds_by_name
      @seconds_by_name ||= HackatimeSyncService.call(maker)
    end

    def claimed_minutes
      @claimed_minutes ||= hackatime_names.sum { |name| seconds_by_name[name].to_i } / 60
    end

    def decided_on
      (review&.decided_at || Time.current).to_date
    end

    def approved_minutes
      review&.approved_minutes_total
    end
  end
end
