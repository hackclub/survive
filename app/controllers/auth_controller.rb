class AuthController < ApplicationController
  allow_unauthenticated_access only: %i[show new create]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to signin_path, alert: "Try again later." }

  def show
    return redirect_to root_path if user_signed_in?

    render inertia: "Auth/SignIn"
  end

  def new
    unless HcaService.configured?
      redirect_to signin_path, alert: "Sign-in isn't configured yet."
      return
    end

    state = SecureRandom.hex(24)
    session[:state] = state

    redirect_to HcaService.authorize_url(hca_callback_url, state), allow_other_host: true
  end

  def create
    if params[:state] != session[:state]
      Rails.logger.warn("[AuthController] state mismatch on HCA callback")
      session[:state] = nil
      redirect_to root_path, alert: "Authentication failed due to a CSRF token mismatch"
      return
    end

    session[:state] = nil
    user = User.exchange_hca_token(params[:code], hca_callback_url)
    session[:user_id] = user.id

    redirect_to root_path, notice: "Welcome back, #{user.display_name}!"
  rescue StandardError => e
    Rails.logger.error("[AuthController] sign-in failed: #{e.message}")
    redirect_to root_path, alert: e.message
  end

  def destroy
    reset_session
    redirect_to root_path, notice: "Signed out successfully."
  end
end
