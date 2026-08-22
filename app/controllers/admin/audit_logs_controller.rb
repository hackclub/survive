class Admin::AuditLogsController < ApplicationController
  def index
    authorize :audit_log

    pagy, entries = pagy(filtered.includes(:actor).recent)

    render inertia: "Admin/AuditLogs/Index", props: {
      entries: entries.map { |entry| serialize(entry) },
      actions: AuditLog.distinct.order(:action).pluck(:action),
      actors: User.where(id: AuditLog.distinct.select(:actor_id)).order(:display_name).map { |u| { id: u.id, name: u.display_name } },
      filters: { action: params[:action_name].to_s, actor: params[:actor_id].to_s },
      pagination: { page: pagy.page, pages: pagy.pages, count: pagy.count }
    }
  end

  private

  def filtered
    scope = AuditLog.all
    scope = scope.where(action: params[:action_name]) if params[:action_name].present?
    scope = scope.where(actor_id: params[:actor_id]) if params[:actor_id].present?
    scope
  end

  def serialize(entry)
    {
      id: entry.id,
      action: entry.action,
      actor: entry.actor&.display_name,
      target: entry.target_type.present? ? "#{entry.target_type} ##{entry.target_id}" : nil,
      metadata: entry.metadata,
      at: entry.created_at.strftime("%b %d, %Y %H:%M")
    }
  end
end
