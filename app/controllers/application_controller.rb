class ApplicationController < ActionController::Base
  include Authentication

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

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
end
