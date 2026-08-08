class Admin::ReviewController < ApplicationController
  def index
    authorize :review

    render inertia: "Admin/Review/Index"
  end
end
