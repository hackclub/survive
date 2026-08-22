class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization
  include Pagy::Backend

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

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
          isAdmin: u.admin?,
          isSuperadmin: u.superadmin?,
          hackatimeConnected: u.hackatime_uid.present?
        }
      }
    }
  }
  inertia_share signInPath: -> { signin_path }
  inertia_share signOutPath: -> { signout_path }
  inertia_share flash: -> { flash.to_hash }

  private

  def audit!(action, target: nil, metadata: {})
    return if current_user.nil?

    AuditLog.create!(actor: current_user, action: action, target: target, metadata: metadata)
  end

  def user_not_authorized
    redirect_back fallback_location: root_path, alert: "You are not authorized to perform this action."
  end
end
