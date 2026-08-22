module HackatimeSyncService
  module_function

  CACHE_TTL = 10.minutes
  REFRESH_LOCK_TTL = 1.minute

  def call(user)
    return {} if user.hackatime_uid.blank?

    Rails.cache.fetch(cache_key(user), expires_in: CACHE_TTL) { fetch_and_link(user) }
  end

  def cached(user)
    return {} if user.hackatime_uid.blank?

    hit = Rails.cache.read(cache_key(user))
    return hit if hit

    enqueue_refresh(user)
    {}
  end

  def refresh!(user)
    return {} if user.hackatime_uid.blank?

    seconds_by_name = fetch_and_link(user)
    Rails.cache.write(cache_key(user), seconds_by_name, expires_in: CACHE_TTL)
    seconds_by_name
  end

  def enqueue_refresh(user)
    return unless Rails.cache.write(lock_key(user), true, expires_in: REFRESH_LOCK_TTL, unless_exist: true)

    HackatimeSyncJob.perform_later(user.id)
  end

  def fetch_and_link(user)
    result = HackatimeService.fetch_stats(user.hackatime_uid, access_token: user.hackatime_token)
    seconds_by_name = result&.dig(:projects) || {}
    return seconds_by_name if seconds_by_name.blank?

    HackatimeProject.insert_all(
      seconds_by_name.keys.map { |name| { user_id: user.id, name: name, created_at: Time.current, updated_at: Time.current } },
      unique_by: %i[user_id name]
    )

    seconds_by_name
  end

  def cache_key(user)
    "hackatime_stats:#{user.id}"
  end

  def lock_key(user)
    "hackatime_stats_refresh:#{user.id}"
  end
end
