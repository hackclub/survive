class HikeGrantsController < ApplicationController
  before_action :set_owned_grant, only: :add_participants

  def index
    public_hikes = HikeGrant.where(visibility: :public, status: %i[approved paid], starts_at: Time.current..)
      .includes(:created_by, :participants).recent
    my_hikes = HikeGrant.joins("LEFT JOIN hike_grant_participants ON hike_grant_participants.hike_grant_id = hike_grants.id")
      .where("hike_grants.created_by_id = :user_id OR (hike_grants.visibility = :private AND hike_grant_participants.user_id = :user_id)", user_id: current_user.id, private: HikeGrant.visibilities[:private])
      .includes(:items, participants: :user).distinct.recent

    render inertia: "HikeGrants/Index", props: {
      publicHikes: public_hikes.map { |grant| serialize_public(grant) },
      grants: my_hikes.map { |grant| serialize_private(grant) },
      costKinds: HikeGrantItem::KINDS.map { |kind, info| { kind: kind, label: info[:label], hint: info[:hint] } },
      woodPerUsd: HikeGrant.wood_per_usd,
      spendable: current_user.spendable_coins
    }
  end

  def create
    attrs = params.require(:hike_grant).permit(:name, :trail, :region, :meeting_point, :starts_at, :visibility)
    grant = HikeGrantSubmission.create!(
      organiser: current_user,
      attributes: {
        name: attrs[:name], trail: attrs[:trail], region: attrs[:region], meeting_point: attrs[:meeting_point],
        starts_at: Time.zone.parse(attrs[:starts_at].to_s),
        visibility: attrs[:visibility].presence_in(%w[public private]) || "public"
      },
      items: params.permit(items: %i[kind amount reason]).fetch(:items, []),
      emails: parse_emails
    )
    audit!("hike_grant.created", target: grant, metadata: { budget_cents: grant.budget_cents,
      participant_count: grant.participants.size, wood_each: grant.participants.maximum(:wood_cost) })
    redirect_to hike_grants_path, notice: "Sent. We've held each person's share of wood and will review your hike soon."
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def add_participants
    added = HikeGrantSubmission.add_participants!(@grant, parse_emails)
    audit!("hike_grant.participants_added", target: @grant, metadata: { user_ids: added.map(&:id) })
    redirect_to hike_grants_path, notice: "Added #{added.size} #{'hiker'.pluralize(added.size)} and re-split the cost."
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  private

  def set_owned_grant
    @grant = HikeGrant.where(created_by: current_user).find(params[:id])
  end

  def parse_emails
    params[:participant_emails].to_s.split(/[\s,;]+/).map { |e| e.strip.downcase }.reject(&:blank?).uniq
  end

  def serialize_items(grant)
    grant.items.map { |item| { id: item.id, label: item.label, amountCents: item.amount_cents, reason: item.reason } }
  end

  def serialize_public(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      organiser: grant.created_by.display_name, participantCount: grant.participants.size }
  end

  def serialize_private(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      budgetCents: grant.budget_cents, items: serialize_items(grant), status: grant.status, visibility: grant.visibility, isOrganiser: grant.created_by_id == current_user.id, decisionReason: grant.decision_reason,
      participants: grant.participants.map { |p| { id: p.id, name: p.user.display_name, email: p.user.email, allocationCents: p.allocation_cents, woodCost: p.wood_cost } } }
  end
end
