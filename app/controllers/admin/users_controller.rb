class Admin::UsersController < ApplicationController
  def index
    authorize :user

    pagy, users = pagy(filtered.order(:display_name))
    minutes = approved_minutes_for(users.map(&:id))

    render inertia: "Admin/Users/Index", props: {
      users: users.map { |user| serialize(user, minutes[user.id].to_i) },
      roles: User::ROLES,
      query: params[:q].to_s,
      pagination: { page: pagy.page, pages: pagy.pages, count: pagy.count }
    }
  end

  def update
    user = User.find(params[:id])
    authorize user

    roles = Array(params[:roles]).map(&:to_s) & User::ROLES
    user.update!(roles: roles)
    audit!("user.roles_changed", target: user, metadata: { roles: roles })

    redirect_to admin_users_path(q: params[:q]), notice: "Updated #{user.display_name}."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_users_path, alert: e.record.errors.full_messages.to_sentence
  end

  def ban
    user = User.find(params[:id])
    authorize user, :ban?

    reason = params[:reason].to_s.strip
    return redirect_to(admin_users_path, alert: "A reason is required to ban.") if reason.blank?

    user.ban!(current_user, reason: reason)
    audit!("user.banned", target: user, metadata: { reason: reason })
    redirect_to admin_users_path(q: params[:q]), notice: "Banned #{user.display_name}."
  end

  def unban
    user = User.find(params[:id])
    authorize user, :unban?

    user.unban!
    audit!("user.unbanned", target: user)
    redirect_to admin_users_path(q: params[:q]), notice: "Lifted the ban on #{user.display_name}."
  end

  private

  def filtered
    return User.all if params[:q].blank?

    term = "%#{params[:q]}%"
    User.where("display_name ILIKE :q OR email ILIKE :q OR slack_id ILIKE :q", q: term)
  end

  def approved_minutes_for(ids)
    return {} if ids.empty?

    approved = Review.approved
      .joins(:project)
      .where(projects: { user_id: ids })
      .group("projects.user_id")
      .sum(:approved_minutes)

    deducted = FinalReview.deducted
      .joins(review: :project)
      .where(projects: { user_id: ids })
      .group("projects.user_id")
      .sum(:deduction_minutes)

    approved.to_h { |user_id, minutes| [ user_id, [ minutes - deducted[user_id].to_i, 0 ].max ] }
  end

  def serialize(user, minutes)
    {
      id: user.id,
      name: user.display_name,
      email: user.email,
      slackId: user.slack_id.presence,
      roles: user.roles,
      banned: user.is_banned?,
      bannedReason: user.banned_reason,
      bannedAt: user.banned_at&.strftime("%b %d, %Y"),
      projects: user.projects.count,
      approvedMinutes: minutes,
      isYou: user.id == current_user.id
    }
  end
end
