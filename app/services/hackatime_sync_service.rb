module HackatimeSyncService
  module_function

  def call(user)
    return {} if user.hackatime_uid.blank?

    result = HackatimeService.fetch_stats(user.hackatime_uid, access_token: user.hackatime_token)
    seconds_by_name = result&.dig(:projects) || {}
    return seconds_by_name if seconds_by_name.blank?

    HackatimeProject.insert_all(
      seconds_by_name.keys.map { |name| { user_id: user.id, name: name, created_at: Time.current, updated_at: Time.current } },
      unique_by: %i[user_id name]
    )

    seconds_by_name
  end
end
