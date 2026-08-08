class DashboardController < ApplicationController
  def index
    projects = current_user.projects.order(updated_at: :desc)

    render inertia: "Dashboard/Index", props: {
      projects: projects.map { |project|
        {
          id: project.id,
          name: project.name,
          status: project.status,
          repoLink: project.repo_link,
          demoLink: project.demo_link,
          updatedAt: project.updated_at.strftime("%b %d, %Y")
        }
      }
    }
  end
end
