class AuthController < ApplicationController
  allow_unauthenticated_access only: %i[show create failure]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to signin_path, alert: "Try again later." }

  def show
    return redirect_to root_path if user_signed_in?

    render inertia: "Auth/SignIn"
  end

  def create
    auth = request.env["omniauth.auth"]
    access_token = auth&.credentials&.token.to_s
    user = User.exchange_hca_token(access_token)
    reset_session
    session[:user_id] = user.id

    redirect_to root_path, notice: "Welcome back, #{user.display_name}!"
  rescue User::AuthenticationError => e
    Rails.logger.error("[AuthController] sign-in failed: #{e.message}")
    redirect_to root_path, alert: e.message
  rescue StandardError => e
    Rails.logger.error("[AuthController] sign-in failed: #{e.class}: #{e.message}")
    redirect_to root_path, alert: "Something went wrong signing you in. Please try again."
  end

  def failure
    redirect_to signin_path, alert: "Authentication failed. Please try again."
  end

  def destroy
    reset_session
    redirect_to root_path, notice: "Signed out successfully."
  end
end
