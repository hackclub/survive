class DocsController < ApplicationController
  def show
    docs = Doc.published
    render inertia: "Docs/Show", props: { docs: docs.map(&:as_client_json) }
  end
end
