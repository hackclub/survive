class SlackInactiveProjectsJob < ApplicationJob
  queue_as :default

  INACTIVE_AFTER = 14.days

  def perform
    Project.includes(:user).where(status: %i[draft returned]).find_each do |project|
      last_activity = [ project.updated_at, project.project_events.maximum(:created_at) ].compact.max
      next if last_activity > INACTIVE_AFTER.ago

      week = Date.current.strftime("%G-%V")
      SlackDmJob.perform_later(
        project.user_id,
        "inactive-project:#{project.id}:#{week}",
        "Your Survive project “#{project.name}” has been quiet for a little while. Pick it back up, make an update, or submit it when you’re ready: #{SlackDmService.project_url(project)}"
      )
    end
  end
end
