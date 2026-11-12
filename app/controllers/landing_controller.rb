class LandingController < ApplicationController
  allow_unauthenticated_access only: %i[index]

  def index
    return redirect_to(dashboard_path) if current_user

    render inertia: "Landing/Index"
  end
end
