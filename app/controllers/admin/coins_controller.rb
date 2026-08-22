class Admin::CoinsController < ApplicationController
  def index
    authorize :coin

    pagy, users = pagy(filtered.order(:display_name))
    earned = CoinPayout.where(user_id: users.map(&:id)).group(:user_id).sum(:coins)
    adjusted = CoinAdjustment.where(user_id: users.map(&:id)).group(:user_id).sum(:amount)

    render inertia: "Admin/Coins/Index", props: {
      users: users.map { |user| row(user, earned[user.id].to_i, adjusted[user.id].to_i) },
      query: params[:q].to_s,
      rate: CoinPayout.rate_per_hour,
      totals: {
        earned: CoinPayout.sum(:coins),
        adjusted: CoinAdjustment.sum(:amount)
      },
      pagination: { page: pagy.page, pages: pagy.pages, count: pagy.count }
    }
  end

  def show
    authorize :coin
    user = User.find(params[:id])

    render inertia: "Admin/Coins/Show", props: {
      maker: {
        id: user.id,
        name: user.display_name,
        email: user.email,
        banned: user.is_banned?,
        earned: user.coins_earned,
        adjusted: user.coins_adjusted,
        balance: user.coin_balance,
        spendable: user.spendable_coins
      },
      entries: ledger(user)
    }
  end

  def adjust
    authorize :coin, :adjust?
    user = User.find(params[:id])

    amount = params[:amount].to_i
    reason = params[:reason].to_s.strip
    return redirect_to(admin_coin_path(user), alert: "An amount and a reason are both required.") if amount.zero? || reason.blank?

    CoinAdjustment.create!(user: user, actor: current_user, amount: amount, reason: reason)
    audit!("coins.adjusted", target: user, metadata: { amount: amount, reason: reason, balance: user.coin_balance })

    redirect_to admin_coin_path(user), notice: "Adjusted #{user.display_name} by #{amount} coins."
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_coin_path(user), alert: e.record.errors.full_messages.to_sentence
  end

  private

  def filtered
    return User.all if params[:q].blank?

    User.where("display_name ILIKE :q OR email ILIKE :q", q: "%#{params[:q]}%")
  end

  def row(user, earned, adjusted)
    {
      id: user.id,
      name: user.display_name,
      email: user.email,
      banned: user.is_banned?,
      earned: earned,
      adjusted: adjusted,
      balance: earned + adjusted,
      spendable: user.is_banned? ? 0 : [ earned + adjusted, 0 ].max
    }
  end

  def ledger(user)
    payouts = user.coin_payouts.includes(:project, :review).map do |payout|
      {
        id: "payout-#{payout.id}",
        at: payout.granted_at,
        kind: "earned",
        amount: payout.coins,
        source: "#{payout.project.name} round #{payout.review.round}",
        detail: "#{payout.net_minutes} minutes at #{payout.rate_per_hour} an hour",
        actor: nil
      }
    end

    adjustments = user.coin_adjustments.includes(:actor).map do |adjustment|
      {
        id: "adjustment-#{adjustment.id}",
        at: adjustment.created_at,
        kind: "adjusted",
        amount: adjustment.amount,
        source: adjustment.reason,
        detail: nil,
        actor: adjustment.actor&.display_name || "system"
      }
    end

    running = 0
    (payouts + adjustments).sort_by { |entry| entry[:at] }.map do |entry|
      running += entry[:amount]
      entry.merge(running: running, at: entry[:at].strftime("%b %d, %Y %H:%M"))
    end.reverse
  end
end
