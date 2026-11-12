class HikeGrantsController < ApplicationController
  before_action :set_owned_grant, only: :add_participants

  def index
    public_hikes = HikeGrant.where(status: %i[approved paid], starts_at: Time.current..)
      .includes(:created_by, :participants).recent
    my_hikes = HikeGrant.where(created_by: current_user).includes(participants: :user).recent

    render inertia: "HikeGrants/Index", props: {
      publicHikes: public_hikes.map { |grant| serialize_public(grant) },
      grants: my_hikes.map { |grant| serialize_private(grant) }
    }
  end

  def create
    attrs = params.require(:hike_grant).permit(:name, :trail, :region, :meeting_point, :starts_at, :budget)
    emails = parse_emails
    return redirect_to(hike_grants_path, alert: "Add at least one participant email.") if emails.empty?
    users = find_users(emails)
    missing = emails - users.keys
    return redirect_to(hike_grants_path, alert: "These emails are not registered Survive users: #{missing.join(", ")}") if missing.any?
    cents = (BigDecimal(attrs.delete(:budget).to_s) * 100).round
    return redirect_to(hike_grants_path, alert: "Enter a valid budget greater than zero.") unless cents.positive?
    return redirect_to(hike_grants_path, alert: "The budget must be at least $0.01 per participant.") if cents < users.size

    grant = nil
    ActiveRecord::Base.transaction do
      grant = HikeGrant.create!(name: attrs[:name], trail: attrs[:trail], region: attrs[:region],
        meeting_point: attrs[:meeting_point], starts_at: Time.zone.parse(attrs[:starts_at]),
        budget_cents: cents, status: :pending, created_by: current_user)
      rebalance!(grant, users.values)
    end
    audit!("hike_grant.created", target: grant, metadata: { budget_cents: cents, participant_count: users.size })
    redirect_to hike_grants_path, notice: "Your hike has been submitted for review."
  rescue ActiveRecord::RecordInvalid, ArgumentError => e
    redirect_to hike_grants_path, alert: e.message
  end

  def add_participants
    emails = parse_emails
    return redirect_to(hike_grants_path, alert: "Add at least one participant email.") if emails.empty?
    users = find_users(emails)
    missing = emails - users.keys
    return redirect_to(hike_grants_path, alert: "These emails are not registered Survive users: #{missing.join(", ")}") if missing.any?

    added = []
    ActiveRecord::Base.transaction do
      @grant.lock!
      raise ArgumentError, "You can only add people while your hike is awaiting review." unless @grant.pending?
      existing_ids = @grant.participants.pluck(:user_id)
      duplicates = users.values.select { |u| existing_ids.include?(u.id) }
      raise ArgumentError, "Already on this hike: #{duplicates.map(&:email).join(", ")}" if duplicates.any?
      all_users = @grant.participants.includes(:user).map(&:user) + users.values
      raise ArgumentError, "The budget must be at least $0.01 per participant." if @grant.budget_cents < all_users.size
      rebalance!(@grant, all_users)
      added = users.values
    end
    audit!("hike_grant.participants_added", target: @grant, metadata: { user_ids: added.map(&:id) })
    redirect_to hike_grants_path, notice: "Added #{added.size} #{'hiker'.pluralize(added.size)}. Shares have been recalculated."
  rescue ActiveRecord::RecordInvalid, ArgumentError => e
    redirect_to hike_grants_path, alert: e.message
  end

  private

  def set_owned_grant
    @grant = HikeGrant.where(created_by: current_user).find(params[:id])
  end

  def parse_emails
    params[:participant_emails].to_s.split(/[\\s,;]+/).map { |e| e.strip.downcase }.reject(&:blank?).uniq
  end

  def find_users(emails)
    User.where("LOWER(email) IN (?)", emails).index_by { |u| u.email.downcase }
  end

  def rebalance!(grant, users)
    base, remainder = grant.budget_cents.divmod(users.size)
    users.each_with_index do |user, i|
      grant.participants.find_or_initialize_by(user: user).update!(allocation_cents: base + (i < remainder ? 1 : 0))
    end
  end

  def serialize_public(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      organiser: grant.created_by.display_name, participantCount: grant.participants.size }
  end

  def serialize_private(grant)
    { id: grant.id, name: grant.name, trail: grant.trail, region: grant.region,
      meetingPoint: grant.meeting_point, startsAt: grant.starts_at.strftime("%b %d, %Y · %H:%M"),
      budgetCents: grant.budget_cents, status: grant.status, decisionReason: grant.decision_reason,
      participants: grant.participants.map { |p| { id: p.id, name: p.user.display_name, email: p.user.email, allocationCents: p.allocation_cents } } }
  end
end
