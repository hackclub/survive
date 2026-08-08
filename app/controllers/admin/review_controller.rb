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

  def approve
    project = Project.find(params[:id])
    authorize project, :review?

    project.approve!(current_user)
    redirect_to admin_review_path, notice: "Approved #{project.name}."
  end

  def reject
    project = Project.find(params[:id])
    authorize project, :review?

    project.reject!(current_user, feedback: params[:feedback])
    redirect_to admin_review_path, notice: "Rejected #{project.name}."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to project_path(project), alert: e.record.errors.full_messages.to_sentence
  end
end
