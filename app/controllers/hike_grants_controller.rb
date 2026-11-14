class HikeGrantsController < ApplicationController
  before_action :set_owned_grant, only: :add_participants
  before_action :set_visible_grant, only: %i[contribute withdraw leave]
  before_action :set_public_grant, only: :join
  before_action :set_owned_grant_for_membership, only: %i[approve_join decline_join]

  allow_unauthenticated_access only: :index

  def index
    public_hikes = HikeGrant.visibility_public.where(status: %i[approved paid], starts_at: Time.current..)
      .includes(:created_by, :participants, :contributions).recent
    map_hikes = HikeGrant.visibility_public.where(status: %i[pending approved paid], starts_at: Time.current..)
      .includes(:created_by).recent
    needs_wood = current_user ? HikeGrant.visibility_public.where(status: :pending, starts_at: Time.current..)
      .includes(:created_by, :items, :contributions).order(:starts_at) : HikeGrant.none
    my_hikes = if current_user
      HikeGrant.joins("LEFT JOIN hike_grant_participants ON hike_grant_participants.hike_grant_id = hike_grants.id")
        .where("hike_grants.created_by_id = :user_id OR hike_grant_participants.user_id = :user_id", user_id: current_user.id)
        .includes(:items, contributions: :user, participants: :user).distinct.recent
    else
      HikeGrant.none
    end

    render inertia: "HikeGrants/Index", props: {
      galleryImages: GalleryImage.where(placement: %w[hikes both]).with_attached_image.ordered.map { |image| { id: image.id, imageUrl: image.image_url, caption: image.caption } },
      publicHikes: public_hikes.map { |grant| serialize_public(grant) },
      mapHikes: map_hikes.map { |grant| serialize_map(grant) },
      needsWood: needs_wood.map { |grant| serialize_needs_wood(grant) },
      grants: my_hikes.map { |grant| serialize_private(grant) },
      costKinds: HikeGrantItem::KINDS.map { |kind, info| { kind: kind, label: info[:label], hint: info[:hint] } },
      woodRate: HikeGrant.wood_per_usd,
      spendable: current_user&.spendable_coins || 0
    }
  end

  def create
    attrs = params.require(:hike_grant).permit(:name, :trail, :region, :meeting_point, :starts_at, :visibility, :latitude, :longitude)
    grant = HikeGrantSubmission.create!(
      organiser: current_user,
      attributes: {
        name: attrs[:name], trail: attrs[:trail], region: attrs[:region], meeting_point: attrs[:meeting_point],
        starts_at: Time.zone.parse(attrs[:starts_at].to_s),
        visibility: attrs[:visibility].presence_in(%w[public private]) || "public",
        latitude: attrs[:latitude].presence, longitude: attrs[:longitude].presence
      },
      items: params.permit(items: %i[kind amount reason]).fetch(:items, []),
      emails: parse_emails,
      wood: params[:wood].to_i
    )
    audit!("hike_grant.created", target: grant, metadata: { budget_cents: grant.budget_cents,
      participant_count: grant.participants.going.size, wood_needed: grant.wood_needed, wood_raised: grant.wood_raised })
    redirect_to hike_grants_path, notice: created_notice(grant)
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def join
    participant = HikeGrantSubmission.join!(@grant, current_user)
    audit!("hike_grant.join_requested", target: @grant, metadata: { participant_id: participant.id })
    redirect_to hike_grants_path, notice: "Join request sent to #{@grant.created_by.display_name}. They'll need to approve it."
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def leave
    HikeGrantSubmission.leave!(@grant, current_user)
    audit!("hike_grant.left", target: @grant)
    redirect_to hike_grants_path, notice: "You've left #{@grant.name}."
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def approve_join
    participant = @grant.participants.find(params[:participant_id])
    HikeGrantSubmission.decide_join_request!(@grant, participant, organiser: current_user, approve: true)
    audit!("hike_grant.join_approved", target: @grant, metadata: { participant_id: participant.id })
    redirect_to hike_grants_path, notice: "#{participant.user.display_name} can now join #{@grant.name}."
  rescue HikeGrantSubmission::Refused, ActiveRecord::RecordInvalid => e
    redirect_to hike_grants_path, alert: e.message
  end

  def decline_join
    participant = @grant.participants.find(params[:participant_id])
    HikeGrantSubmission.decide_join_request!(@grant, participant, organiser: current_user, approve: false)
    audit!("hike_grant.join_declined", target: @grant, metadata: { participant_id: participant.id })
    redirect_to hike_grants_path, notice: "Join request declined."
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

  def set_public_grant
    @grant = HikeGrant.visibility_public.find(params[:id])
  end

  def set_owned_grant
    @grant = HikeGrant.where(created_by: current_user).find(params[:id])
  end

  def set_owned_grant_for_membership
    @grant = HikeGrant.where(created_by: current_user).find(params[:id])
  end

  def set_visible_grant
    @grant = HikeGrant.left_joins(:participants)
      .where("hike_grants.visibility = :public OR hike_grants.created_by_id = :user_id OR hike_grant_participants.user_id = :user_id",
        public: HikeGrant.visibilities[:public], user_id: current_user.id)
      .distinct.find(params[:id])
  end

  def created_notice(grant)
    "Sent for review. Approval confirms the hike can go ahead; it will still need #{grant.wood_remaining} wood before HCB funding can be issued."
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
      myWood: current_user ? grant.contributions.select { |c| c.user_id == current_user.id }.sum(&:wood) : 0 }
  end

  def serialize_public(grant)
    mine = current_user ? grant.participants.find { |p| p.user_id == current_user.id } : nil
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      organiser: grant.created_by.display_name, participantCount: grant.participants.going.size,
      latitude: grant.latitude&.to_f, longitude: grant.longitude&.to_f,
      joined: mine&.membership_approved? || false, joinPending: mine&.membership_pending? || false,
      joinable: (mine.nil? || mine.membership_left? || mine.membership_declined?) && grant.approved? && !grant.participants.issued.exists?, status: grant.status }.merge(wood_props(grant))
  end

  def serialize_map(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      latitude: grant.latitude&.to_f, longitude: grant.longitude&.to_f, status: grant.status }
  end

  def serialize_needs_wood(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"), organiser: grant.created_by.display_name,
      isOrganiser: grant.created_by_id == current_user.id,
      items: grant.items.map { |item| { id: item.id, label: item.label, reason: item.reason } } }.merge(wood_props(grant))
  end

  def serialize_private(grant)
    participants = grant.participants.going.includes(:user).map do |p|
      { id: p.id, name: p.user.display_name, email: p.user.email, allocationCents: p.allocation_cents, userId: p.user_id }
    end
    requests = grant.participants.join_requests.includes(:user).map do |p|
      { id: p.id, name: p.user.display_name, email: p.user.email }
    end
    my_membership = grant.participants.find_by(user_id: current_user.id)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      budgetCents: grant.budget_cents, items: serialize_items(grant), status: grant.status, visibility: grant.visibility,
      latitude: grant.latitude&.to_f, longitude: grant.longitude&.to_f,
      isOrganiser: grant.created_by_id == current_user.id, decisionReason: grant.decision_reason,
      participants: participants, joinRequests: requests,
      myMembership: my_membership&.membership_status, contributors: contributors(grant) }.merge(wood_props(grant))
  end

  def contributors(grant)
    grant.contributions.group_by(&:user).map { |user, rows| { name: user.display_name, wood: rows.sum(&:wood) } }
      .sort_by { |row| -row[:wood] }
  end
end
