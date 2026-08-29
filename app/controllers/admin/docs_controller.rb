class Admin::DocsController < ApplicationController
  before_action :set_doc, only: %i[edit update destroy]

  def index
    authorize Doc
    render inertia: "Admin/Docs/Index", props: { docs: Doc.ordered.map(&:as_client_json) }
  end

  def new
    authorize Doc
    render inertia: "Admin/Docs/Form", props: { doc: nil }
  end

  def create
    doc = Doc.new(doc_params)
    authorize doc
    doc.updated_by = current_user
    if doc.save
      audit!("doc.created", target: doc, metadata: { title: doc.title })
      redirect_to edit_admin_doc_path(doc), notice: "Documentation created."
    else
      redirect_to new_admin_doc_path, inertia: { errors: doc.errors.messages }
    end
  end

  def edit
    authorize @doc
    render inertia: "Admin/Docs/Form", props: { doc: @doc.as_client_json }
  end

  def update
    authorize @doc
    @doc.assign_attributes(doc_params)
    @doc.updated_by = current_user
    if @doc.save
      audit!("doc.updated", target: @doc, metadata: { title: @doc.title })
      redirect_to edit_admin_doc_path(@doc), notice: "Documentation saved."
    else
      redirect_to edit_admin_doc_path(@doc), inertia: { errors: @doc.errors.messages }
    end
  end

  def destroy
    authorize @doc
    title = @doc.title
    @doc.destroy!
    audit!("doc.deleted", metadata: { title: title })
    redirect_to admin_docs_path, notice: "Documentation deleted."
  end

  private

  def set_doc
    @doc = Doc.find(params[:id])
  end

  def doc_params
    params.permit(:title, :slug, :body, :position, :published)
  end
end
