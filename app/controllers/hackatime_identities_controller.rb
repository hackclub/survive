class HackatimeIdentitiesController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    access_token = auth&.credentials&.token.to_s
    uid = HackatimeService.fetch_authenticated_user(access_token)

    if uid.blank?
      redirect_to camp_path, alert: "Could not connect Hackatime. Please try again."
      return
    end

    current_user.update!(hackatime_uid: uid, hackatime_token: access_token)
    redirect_to camp_path, notice: "Hackatime connected!"
  rescue ActiveRecord::RecordInvalid => e
    redirect_to camp_path, alert: e.record.errors.full_messages.to_sentence
  end
end
