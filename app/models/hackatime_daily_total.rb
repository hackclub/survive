# Someone's Hackatime total for a day. total_seconds covers everything they've logged;
# linked_seconds only the Hackatime projects linked to a Survive project. Comparing a day
# with the one before tells us whether they coded that day.
class HackatimeDailyTotal < ApplicationRecord
  belongs_to :user

  def self.record!(user, seconds_by_name, day: Time.current.to_date)
    linked_names = user.hackatime_projects.where.not(project_id: nil).pluck(:name)
    now = Time.current

    upsert({ user_id: user.id, day: day, total_seconds: seconds_by_name.values.sum,
      linked_seconds: seconds_by_name.slice(*linked_names).values.sum, created_at: now, updated_at: now },
      unique_by: %i[user_id day], update_only: %i[total_seconds linked_seconds])
  end
end
