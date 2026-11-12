class Admin::HikeGrantsController < ApplicationController
  def index
    authorize :hike_grant

    grants = HikeGrant.includes(:created_by, :reviewed_by, participants: :user).recent
    render inertia: "Admin/HikeGrants/Index", props: {
      grants: grants.map { |grant| serialize(grant) },
      stats: {
        total: HikeGrant.count,
        pending: HikeGrant.pending.count,
        approved: HikeGrant.approved.count,
        allocatedCents: HikeGrant.joins(:participants).sum("hike_grant_participants.allocation_cents")
      }
    }
  end

  def create
    authorize :hike_grant, :manage?
    attributes = params.require(:hike_grant).permit(:name, :trail, :region, :meeting_point, :starts_at, :budget)
    emails = params[:participant_emails].to_s.split(/[\s,;]+/).map { |email| email.strip.downcase }.reject(&:blank?).uniq
    return redirect_to(admin_hike_grants_path, alert: "Add at least one participant email.") if emails.empty?

    users = User.where("LOWER(email) IN (?)", emails).index_by { |user| user.email.downcase }
    missing = emails - users.keys
    return redirect_to(admin_hike_grants_path, alert: "These emails are not registered Survive users: #{missing.join(", ")}") if missing.any?

    budget_cents = (BigDecimal(attributes.delete(:budget).to_s) * 100).round
    return redirect_to(admin_hike_grants_path, alert: "Enter a valid budget greater than zero.") unless budget_cents.positive?

    ActiveRecord::Base.transaction do
      grant = HikeGrant.create!(
        name: attributes[:name],
        trail: attributes[:trail],
        region: attributes[:region],
        meeting_point: attributes[:meeting_point],
        starts_at: Time.zone.parse(attributes[:starts_at]),
        budget_cents: budget_cents,
        status: :pending,
        created_by: current_user
      )

      base, remainder = budget_cents.divmod(users.size)
      users.values.each_with_index do |user, index|
        allocation = base + (index < remainder ? 1 : 0)
        grant.participants.create!(user: user, allocation_cents: allocation)
      end
    end

    grant = HikeGrant.order(:created_at).last
    audit!("hike_grant.created", target: grant, metadata: { budget_cents: budget_cents, participant_count: emails.size })
    redirect_to admin_hike_grants_path, notice: "Hike grant submitted for admin review."
  rescue ActiveRecord::RecordInvalid, ArgumentError => e
    redirect_to admin_hike_grants_path, alert: e.message
  end

  def decide
    authorize :hike_grant, :manage?
    grant = HikeGrant.find(params[:id])

    case params[:decision]
    when "approve"
      grant.approve!(current_user)
      audit!("hike_grant.approved", target: grant, metadata: { budget_cents: grant.budget_cents })
      redirect_to admin_hike_grants_path, notice: "Approved #{grant.name}. Individual allocations are ready for HCB processing."
    when "reject"
      reason = params[:reason].to_s.strip
      return redirect_to(admin_hike_grants_path, alert: "A rejection reason is required.") if reason.blank?
      grant.reject!(current_user, reason: reason)
      audit!("hike_grant.rejected", target: grant, metadata: { reason: reason })
      redirect_to admin_hike_grants_path, notice: "Rejected #{grant.name}."
    else
      redirect_to admin_hike_grants_path, alert: "Choose approve or reject."
    end
  rescue ArgumentError, ActiveRecord::RecordInvalid => e
    redirect_to admin_hike_grants_path, alert: e.message
  end

  def issue_participant
    authorize :hike_grant, :manage?
    grant = HikeGrant.find(params[:id])
    participant = grant.participants.find(params[:participant_id])
    reference = params[:hcb_grant_id].to_s.strip
    return redirect_to(admin_hike_grants_path, alert: "Enter the HCB card grant ID or reference after creating it in HCB.") if reference.blank?

    participant.update!(
      status: :issued,
      hcb_grant_id: reference,
      hcb_grant_url: params[:hcb_grant_url].to_s.strip.presence,
      issued_at: Time.current
    )
    grant.refresh_payment_status!
    audit!("hike_grant.participant_issued", target: participant, metadata: { hike_grant_id: grant.id, user_id: participant.user_id, allocation_cents: participant.allocation_cents, hcb_grant_id: reference })
    redirect_to admin_hike_grants_path, notice: "Recorded the HCB grant for #{participant.user.display_name}."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_hike_grants_path, alert: e.record.errors.full_messages.to_sentence
  end

  private

  def serialize(grant)
    {
      id: grant.id,
      name: grant.name,
      trail: grant.trail,
      region: grant.region,
      meetingPoint: grant.meeting_point,
      startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      budgetCents: grant.budget_cents,
      allocatedCents: grant.allocated_cents,
      status: grant.status,
      notes: grant.notes,
      decisionReason: grant.decision_reason,
      createdBy: grant.created_by.display_name,
      reviewedBy: grant.reviewed_by&.display_name,
      participants: grant.participants.map do |participant|
        {
          id: participant.id,
          userId: participant.user_id,
          name: participant.user.display_name,
          email: participant.user.email,
          allocationCents: participant.allocation_cents,
          status: participant.status,
          hcbGrantId: participant.hcb_grant_id,
          hcbGrantUrl: participant.hcb_grant_url,
          issuedAt: participant.issued_at&.strftime("%b %d, %Y")
        }
      end
    }
  end
end
