class HikeGrantsController < ApplicationController
  before_action :set_owned_grant, only: :add_participants
  before_action :set_visible_grant, only: %i[contribute withdraw]

  def index
    public_hikes = HikeGrant.where(visibility: :public, status: %i[approved paid], starts_at: Time.current..)
      .includes(:created_by, :participants).recent
    needs_wood = HikeGrant.where(visibility: :public, status: :pending, starts_at: Time.current..)
      .includes(:created_by, :items, :contributions).order(:starts_at)
    my_hikes = HikeGrant.joins("LEFT JOIN hike_grant_participants ON hike_grant_participants.hike_grant_id = hike_grants.id")
      .where("hike_grants.created_by_id = :user_id OR hike_grant_participants.user_id = :user_id", user_id: current_user.id)
      .includes(:items, contributions: :user, participants: :user).distinct.recent

    render inertia: "HikeGrants/Index", props: {
      galleryImages: GalleryImage.where(placement: %w[hikes both]).with_attached_image.ordered.map { |image| { id: image.id, imageUrl: image.image_url, caption: image.caption } },\n      publicHikes: public_hikes.map { |grant| serialize_public(grant) },
      needsWood: needs_wood.map { |grant| serialize_needs_wood(grant) },
      grants: my_hikes.map { |grant| serialize_private(grant) },
      costKinds: HikeGrantItem::KINDS.map { |kind, info| { kind: kind, label: info[:label], hint: info[:hint] } },
      woodRate: HikeGrant.wood_per_usd,
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
      emails: parse_emails,
      wood: params[:wood].to_i
    )
    audit!("hike_grant.created", target: grant, metadata: { budget_cents: grant.budget_cents,
      participant_count: grant.participants.size, wood_needed: grant.wood_needed, wood_raised: grant.wood_raised })
    redirect_to hike_grants_path, notice: created_notice(grant)
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def add_participants
    added = HikeGrantSubmission.add_participants!(@grant, parse_emails)
    audit!("hike_grant.participants_added", target: @grant, metadata: { user_ids: added.map(&:id) })
    redirect_to hike_grants_path, notice: "Added #{added.size} #{'hiker'.pluralize(added.size)}."
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def contribute
    contribution = HikeGrantSubmission.contribute!(@grant, current_user, params[:wood])
    audit!("hike_grant.contributed", target: @grant, metadata: { wood: contribution.wood })
    redirect_to hike_grants_path, notice: "You put #{contribution.wood} wood into #{@grant.name}."
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def withdraw
    wood = HikeGrantSubmission.withdraw!(@grant, current_user)
    audit!("hike_grant.contribution_withdrawn", target: @grant, metadata: { wood: wood })
    redirect_to hike_grants_path, notice: "#{wood} wood is back in your purse."
  rescue HikeGrantSubmission::Refused => e
    redirect_to hike_grants_path, alert: e.message
  end

  private

  def set_owned_grant
    @grant = HikeGrant.where(created_by: current_user).find(params[:id])
  end

  # Public hikes, plus private ones the user organised or is on.
  def set_visible_grant
    @grant = HikeGrant.left_joins(:participants)
      .where("hike_grants.visibility = :public OR hike_grants.created_by_id = :user_id OR hike_grant_participants.user_id = :user_id",
        public: HikeGrant.visibilities[:public], user_id: current_user.id)
      .distinct.find(params[:id])
  end

  def created_notice(grant)
    return "Sent, and it's fully paid. We'll review it soon." if grant.funded?

    "Sent. It needs #{grant.wood_remaining} more wood before we can approve it. Anyone can chip in."
  end

  def parse_emails
    params[:participant_emails].to_s.split(/[\s,;]+/).map { |e| e.strip.downcase }.reject(&:blank?).uniq
  end

  def serialize_items(grant)
    grant.items.map { |item| { id: item.id, label: item.label, amountCents: item.amount_cents, reason: item.reason } }
  end

  def wood_props(grant)
    raised = grant.wood_raised
    { woodNeeded: grant.wood_needed, woodRaised: raised,
      myWood: grant.contributions.select { |c| c.user_id == current_user.id }.sum(&:wood) }
  end

  def serialize_public(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      organiser: grant.created_by.display_name, participantCount: grant.participants.size }
  end

  # Pending hikes anyone can chip in to. The meeting point stays hidden until it's approved.
  def serialize_needs_wood(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"), organiser: grant.created_by.display_name,
      isOrganiser: grant.created_by_id == current_user.id,
      items: grant.items.map { |item| { id: item.id, label: item.label, reason: item.reason } } }.merge(wood_props(grant))
  end

  def serialize_private(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      budgetCents: grant.budget_cents, items: serialize_items(grant), status: grant.status, visibility: grant.visibility,
      isOrganiser: grant.created_by_id == current_user.id, decisionReason: grant.decision_reason,
      participants: grant.participants.map { |p| { id: p.id, name: p.user.display_name, email: p.user.email, allocationCents: p.allocation_cents } },
      contributors: contributors(grant) }.merge(wood_props(grant))
  end

  def contributors(grant)
    grant.contributions.group_by(&:user).map { |user, rows| { name: user.display_name, wood: rows.sum(&:wood) } }
      .sort_by { |row| -row[:wood] }
  end
end
