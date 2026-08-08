class Admin::ReviewController < ApplicationController
  def index
    authorize :review

    projects = Project.reviewable.includes(:user).order(:updated_at)

    render inertia: "Admin/Review/Index", props: {
      projects: projects.map { |project|
        {
          id: project.id,
          name: project.name,
          ownerName: project.user.display_name,
          repoLink: project.repo_link,
          demoLink: project.demo_link,
          submittedAt: project.updated_at.strftime("%b %d, %Y")
        }
      }
    }
  end
end
