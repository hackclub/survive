class ProjectsController < ApplicationController
  before_action :set_project, only: %i[show update submit_for_review]

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

  def show
    authorize @project

    render inertia: "Projects/Show", props: {
      project: @project.as_client_json,
      can: {
        update: policy(@project).update?,
        submitForReview: policy(@project).submit_for_review?
      }
    }
  end

  def update
    authorize @project

    if @project.update(project_params)
      redirect_to dashboard_path, notice: "Project saved."
    else
      redirect_back fallback_location: project_path(@project), inertia: { errors: @project.errors.messages }
    end
  end

  def submit_for_review
    authorize @project

    @project.submit!
    redirect_to project_path(@project), notice: "Submitted for review!"
  rescue ActiveRecord::RecordInvalid => e
    redirect_to project_path(@project), alert: e.record.errors.full_messages.to_sentence
  end

  private

  def set_project
    @project = Project.find(params[:id])
  end

  def project_params
    params.expect(project: %i[name description repo_link demo_link])
  end
end
