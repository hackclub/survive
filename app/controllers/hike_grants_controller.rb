class HikeGrantsController < ApplicationController
  before_action :set_owned_grant, only: :add_participants

  def index
    grants = current_user_hike_grants.includes(participants: :user).recent
    render inertia: "HikeGrants/Index", props: { grants: grants.map { |grant| serialize(grant) } }
  end

  def create
    attributes = params.require(:hike_grant).permit(:name, :trail, :region, :meeting_point, :starts_at, :budget)
    emails = participant_emails
    return redirect_to(hike_grants_path, alert: "Add at least one participant email.") if emails.empty?

    users = registered_users(emails)
    missing = emails - users.keys
    return redirect_to(hike_grants_path, alert: "These emails are not registered Survive users: #{missing.join(", ")}") if missing.any?

    budget_cents = (BigDecimal(attributes.delete(:budget).to_s) * 100).round
    return redirect_to(hike_grants_path, alert: "Enter a valid budget greater than zero.") unless budget_cents.positive?
    return redirect_to(hike_grants_path, alert: "The budget must be at least $0.01 per participant.") if budget_cents < users.size

    grant = nil
    ActiveRecord::Base.transaction do
      grant = HikeGrant.create!(
        name: attributes[:name], trail: attributes[:trail], region: attributes[:region],
        meeting_point: attributes[:meeting_point], starts_at: Time.zone.parse(attributes[:starts_at]),
        budget_cents: budget_cents, status: :pending, created_by: current_user
      )
      rebalance!(grant, users.values)
    end
    audit!("hike_grant.created", target: grant, metadata: { budget_cents: budget_cents, participant_count: users.size })
    redirect_to hike_grants_path, notice: "Your hike has been submitted for review."
  rescue ActiveRecord::RecordInvalid, ArgumentError => e
    redirect_to hike_grants_path, alert: e.message
  end

  def add_participants
    emails = participant_emails
    return redirect_to(hike_grants_path, alert: "Add at least one participant email.") if emails.empty?

    users = registered_users(emails)
    missing = emails - users.keys
    return redirect_to(hike_grants_path, alert: "These emails are not registered Survive users: #{missing.join(", ")}") if missing.any?

    added = []
    ActiveRecord::Base.transaction do
      @grant.lock!
      raise ArgumentError, "You can only add people while your hike is awaiting review." unless @grant.pending?

      existing_ids = @grant.participants.pluck(:user_id)
      duplicates = users.values.select { |user| existing_ids.include?(user.id) }
      raise ArgumentError, "These people are already on your hike: #{duplicates.map(&:email).join(", ")}" if duplicates.any?

      all_users = @grant.participants.includes(:user).map(&:user) + users.values
      raise ArgumentError, "The budget must be at least $0.01 per participant." if @grant.budget_cents < all_users.size
      rebalance!(@grant, all_users)
      added = users.values
    end

    audit!("hike_grant.participants_added", target: @grant, metadata: { user_ids: added.map(&:id), participant_count: added.size })
    redirect_to hike_grants_path, notice: "Added #{added.size} #{'hiker'.pluralize(added.size)}. The budget has been split evenly again."
  rescue ActiveRecord::RecordInvalid, ArgumentError => e
    redirect_to hike_grants_path, alert: e.message
  end

  private

  def current_user_hike_grants
    HikeGrant.where(created_by: current_user)
  end

  def set_owned_grant
    @grant = current_user_hike_grants.find(params[:id])
  end

  def participant_emails
    params[:participant_emails].to_s.split(/[\\s,;]+/).map { |email| email.strip.downcase }.reject(&:blank?).uniq
  end

  def registered_users(emails)
    User.where("LOWER(email) IN (?)", emails).index_by { |user| user.email.downcase }
  end

  def rebalance!(grant, users)
    base, remainder = grant.budget_cents.divmod(users.size)
    users.each_with_index do |user, index|
      allocation = base + (index < remainder ? 1 : 0)
      participant = grant.participants.find_or_initialize_by(user: user)
      participant.update!(allocation_cents: allocation)
    end
  end

  def serialize(grant)
    {
      id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      budgetCents: grant.budget_cents, status: grant.status, decisionReason: grant.decision_reason,
      participants: grant.participants.map { |p| { id: p.id, name: p.user.display_name, email: p.user.email, allocationCents: p.allocation_cents } }
    }
  end
end
