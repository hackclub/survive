# Records everyone's Hackatime totals for today, for the admin stats page. Runs a few times
# a day so a late-night session still lands on the right day.
class HackatimeSnapshotJob < ApplicationJob
  queue_as :default

  def perform
    User.where.not(hackatime_uid: [ nil, "" ]).where(is_banned: false).find_each do |user|
      result = HackatimeService.fetch_stats(user.hackatime_uid, access_token: user.hackatime_token)
      next if result.nil?

      HackatimeDailyTotal.record!(user, result[:projects])
    rescue StandardError => e
      Rails.logger.error("HackatimeSnapshotJob user=#{user.id} #{e.class}")
    end
  end
end
