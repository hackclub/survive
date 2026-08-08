class DashboardController < ApplicationController
  def index
    projects = current_user.projects.order(updated_at: :desc)

    render inertia: "Dashboard/Index", props: {
      projects: projects.map(&:as_client_json)
    }
  end
end
