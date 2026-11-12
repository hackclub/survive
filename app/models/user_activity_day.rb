# A day someone opened the site while signed in. Written at most once per person per day.
class UserActivityDay < ApplicationRecord
  belongs_to :user

  def self.record!(user, day: Time.current.to_date)
    return if user.nil?
    return unless Rails.cache.write("seen/#{user.id}/#{day}", true, expires_in: 1.day, unless_exist: true)

    insert_all([ { user_id: user.id, day: day, created_at: Time.current } ], unique_by: %i[user_id day])
  end
end
