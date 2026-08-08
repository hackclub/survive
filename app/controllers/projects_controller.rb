class ProjectsController < ApplicationController
  def new
    authorize Project.new(user: current_user)

    render inertia: "Projects/New"
  end

  def create
    project = current_user.projects.build(project_params)
    project.status = :draft
    authorize project

    if project.save
      redirect_to dashboard_path, notice: "Project created as a draft."
    else
      redirect_back fallback_location: new_project_path, inertia: { errors: project.errors.messages }
    end
  end

  private

  def project_params
    params.expect(project: %i[name description repo_link demo_link])
  end
end
