class LandingController < ApplicationController
  def index
    render inertia: "Landing/Index"
  end
end
