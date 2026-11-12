class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization
  include Pagy::Backend

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  after_action :record_activity

  inertia_share auth: -> {
    {
      user: current_user&.then { |u|
        {
          id: u.id,
          displayName: u.display_name,
          email: u.email,
          avatar: u.avatar_url,
          isReviewer: u.reviewer?,
          isFraud: u.fraud?,
          isFulfiller: u.fulfiller?,
          isAdmin: u.admin?,
          isSuperadmin: u.superadmin?,
          hackatimeConnected: u.hackatime_uid.present?,
          ordersChanged: u.orders.where(state: %i[approved fulfilled]).where(updated_at: 3.days.ago..).exists?,
          coins: {
            earned: u.coins_earned,
            adjusted: u.coins_adjusted,
            held: u.coins_held,
            heldOrders: u.orders.held.count,
            heldHikes: u.hike_wood_held,
            spendable: u.spendable_coins
          }
        }
      }
    }
  }
  inertia_share signInPath: -> { signin_path }
  inertia_share signOutPath: -> { signout_path }
  inertia_share flash: -> { flash.to_hash }

  private

  # Counts signed-in visits for daily active users. Never lets a tracking hiccup break a page.
  def record_activity
    UserActivityDay.record!(current_user) if current_user && request.get?
  rescue StandardError => e
    Rails.logger.warn("record_activity #{e.class}")
  end

  def audit!(action, target: nil, metadata: {})
    return if current_user.nil?

    AuditLog.create!(actor: current_user, action: action, target: target, metadata: metadata)
  end

  def user_not_authorized
    redirect_back fallback_location: root_path, alert: "You are not authorized to perform this action."
  end
end
