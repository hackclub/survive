class Admin::HikeGrantsController < ApplicationController
  def index
    authorize :hike_grant

    render inertia: "Admin/HikeGrants/Index"
  end
end
