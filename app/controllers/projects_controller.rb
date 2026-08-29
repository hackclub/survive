class ProjectsController < ApplicationController
  before_action :set_project, only: %i[show update link_hackatime_project unlink_hackatime_project]

  def new
    authorize Project.new(user: current_user)

    seconds_by_name = HackatimeSyncService.call(current_user)

    render inertia: "Projects/New", props: {
      hackatimeProjects: current_user.hackatime_projects.where(project_id: nil).order(:name).map { |hackatime_project|
        {
          id: hackatime_project.id,
          name: hackatime_project.name,
          seconds: seconds_by_name[hackatime_project.name].to_i
        }
      }
    }
  end

  def create
    project = current_user.projects.build(project_params)
    project.status = :draft
    authorize project
    attach_banner_if_uploaded(project)

    if project.save
      if params[:hackatime_project_name].present?
        HackatimeProject.link(user: current_user, project: project, name: params[:hackatime_project_name])
      end

      redirect_to camp_path, notice: "Project created as a draft."
    else
      redirect_back fallback_location: new_project_path, inertia: { errors: project.errors.messages }
    end
  end

  def show
    authorize @project
    seconds_by_name = HackatimeSyncService.call(current_user)

    render inertia: "Projects/Show", props: {
      project: @project.as_client_json,
      can: {
        update: policy(@project).update?,
        submitForReview: policy(@project).submit_for_review?
      },
      checks: checks_for(@project),
      hackatimeProjects: current_user.hackatime_projects.where(project_id: [ nil, @project.id ]).order(:name).map { |hackatime_project|
        {
          id: hackatime_project.id,
          name: hackatime_project.name,
          linked: hackatime_project.project_id == @project.id,
          seconds: seconds_by_name[hackatime_project.name].to_i
        }
      }
    }
  end

  def update
    authorize @project
    attach_banner_if_uploaded(@project)

    unless @project.update(project_params)
      redirect_back fallback_location: project_path(@project), inertia: { errors: @project.errors.messages }
      return
    end

    if params[:submit_for_review].present?
      authorize @project, :submit_for_review?
      @project.submit!
      redirect_to project_path(@project), notice: "Submitted for review!"
    else
      redirect_to camp_path, notice: "Project saved."
    end
  rescue Project::NotReadyToSubmit => e
    redirect_to project_path(@project), inertia: { errors: { base: e.reasons } }
  rescue ActiveRecord::RecordInvalid => e
    redirect_to project_path(@project), inertia: { errors: e.record.errors.messages }
  end

  def link_hackatime_project
    authorize @project, :update?

    hackatime_project = current_user.hackatime_projects.find(params[:hackatime_project_id])
    linked = HackatimeProject.link(user: current_user, project: @project, name: hackatime_project.name)

    if linked.project_id == @project.id
      redirect_to project_path(@project), notice: "Linked #{hackatime_project.name}."
    else
      redirect_to project_path(@project), alert: "#{hackatime_project.name} is already linked to another project."
    end
  end

  def unlink_hackatime_project
    authorize @project, :update?

    hackatime_project = current_user.hackatime_projects.find(params[:hackatime_project_id])
    hackatime_project.update(project: nil) if hackatime_project.project_id == @project.id
    redirect_to project_path(@project), notice: "Unlinked #{hackatime_project.name}."
  end

  private

  def checks_for(project)
    return SurviveCheckService.cached_run(project: project) if policy(project).submit_for_review?

    project.latest_review&.checks
  end

  def set_project
    @project = Project.find(params[:id])
  end

  def project_params
    params.permit(:name, :description, :repo_link, :demo_link)
  end

  def attach_banner_if_uploaded(project)
    banner_param = params[:banner]
    return if banner_param.blank?

    project.banner.attach(banner_param)
  end
end
