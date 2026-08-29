class DocsController < ApplicationController
  def show
    render inertia: "Docs/Show"
  end
end
