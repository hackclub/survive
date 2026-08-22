class Admin::OrdersController < ApplicationController
  STATES = Order.states.keys.freeze

  def index
    authorize Order, :manage?

    pagy, orders = pagy(scope.includes(:user, :shop_item).recent)
    balances = balances_for(orders.map(&:user).uniq)

    render inertia: "Admin/Orders/Index", props: {
      orders: orders.map { |order| serialize(order, balances[order.user_id]) },
      tabs: STATES.map { |state| { key: state, label: state.humanize, count: Order.where(state: state).count } },
      filter: filter,
      pagination: { page: pagy.page, pages: pagy.pages, count: pagy.count }
    }
  end

  def decide
    order = Order.find(params[:id])
    authorize order, :decide?

    unless order.decidable?
      return redirect_to(admin_orders_path, alert: "#{order.frozen_item_name} has already been decided.")
    end

    case params[:decision]
    when "approve" then approve(order)
    when "hold" then hold(order)
    when "reject" then reject(order)
    else redirect_to admin_orders_path, alert: "Pick a decision."
    end
  rescue ActiveRecord::RecordInvalid => e
    redirect_to admin_orders_path, alert: e.record.errors.full_messages.to_sentence
  end

  def refund
    order = Order.find(params[:id])
    authorize order, :decide?

    reason = params[:reason].to_s.strip
    return redirect_to(admin_orders_path, alert: "A reason is required to refund.") if reason.blank?
    return redirect_to(admin_orders_path, alert: "Only a fulfilled order can be refunded.") unless order.fulfilled?

    order.refund!(current_user, reason: reason)
    audit!("order.refunded", target: order, metadata: metadata(order).merge(reason: reason))
    redirect_to admin_orders_path, notice: "Refunded #{order.total_coins} coins to #{order.user.display_name}."
  end

  private

  def approve(order)
    order.approve!(current_user, notes: params[:notes])
    audit!("order.approved", target: order, metadata: metadata(order))
    redirect_to admin_orders_path, notice: "Approved #{order.frozen_item_name}."
  end

  def hold(order)
    order.hold!(current_user, notes: params[:notes])
    audit!("order.held", target: order, metadata: metadata(order))
    redirect_to admin_orders_path, notice: "Put #{order.frozen_item_name} on hold."
  end

  def reject(order)
    reason = params[:reason].to_s.strip
    return redirect_to(admin_orders_path, alert: "A reason is required to reject.") if reason.blank?

    order.reject!(current_user, reason: reason, fraud_project: fraud_project)
    audit!("order.rejected", target: order, metadata: metadata(order).merge(reason: reason))
    redirect_to admin_orders_path, notice: "Rejected #{order.frozen_item_name}. #{order.total_coins} coins released."
  end

  def fraud_project
    return nil if params[:fraud_related_project_id].blank?

    Project.find_by(id: params[:fraud_related_project_id])
  end

  def metadata(order)
    { user_id: order.user_id, item: order.frozen_item_name, coins: order.total_coins }
  end

  def filter
    params[:filter].to_s.in?(STATES) ? params[:filter].to_s : "pending"
  end

  def scope
    Order.where(state: filter)
  end

  def balances_for(users)
    users.index_by(&:id).transform_values do |user|
      { balance: user.coin_balance, held: user.coins_held, priorDeductions: prior_deductions(user) }
    end
  end

  def prior_deductions(user)
    FinalReview.where(status: %i[deducted banned]).joins(review: :project).where(projects: { user_id: user.id }).count
  end

  def serialize(order, maker)
    {
      id: order.id,
      name: order.frozen_item_name,
      kind: order.kind,
      state: order.state,
      quantity: order.quantity,
      coins: order.total_coins,
      region: order.region,
      amountUsd: order.amount_usd&.to_f,
      makerName: order.user.display_name,
      makerBanned: order.user.is_banned?,
      makerBalance: maker&.dig(:balance),
      makerPriorDeductions: maker&.dig(:priorDeductions),
      addressLines: order.address_lines,
      placedAt: order.created_at.strftime("%b %d, %H:%M"),
      reviewNotes: order.review_notes,
      rejectionReason: order.rejection_reason,
      decidable: order.decidable?
    }
  end
end
