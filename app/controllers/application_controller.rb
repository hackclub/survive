class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization

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
          isAdmin: u.admin?
        }
      }
    }
  }
  inertia_share signInPath: -> { signin_path }
  inertia_share signOutPath: -> { signout_path }
  inertia_share flash: -> { flash.to_hash }

  private

  def user_not_authorized
    redirect_back fallback_location: root_path, alert: "You are not authorized to perform this action."
  end
end
