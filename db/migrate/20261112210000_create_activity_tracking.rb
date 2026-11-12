# Two small tables behind the admin stats page.
# - user_activity_days: one row per person per day they opened the site while signed in.
# - hackatime_daily_totals: each person's Hackatime seconds, refreshed through the day, so a
#   day where the total grew is a day they were coding.
class CreateActivityTracking < ActiveRecord::Migration[8.1]
  def change
    create_table :user_activity_days do |t|
      t.references :user, null: false, foreign_key: true, index: false
      t.date :day, null: false
      t.datetime :created_at, null: false
    end
    add_index :user_activity_days, %i[user_id day], unique: true
    add_index :user_activity_days, :day

    create_table :hackatime_daily_totals do |t|
      t.references :user, null: false, foreign_key: true, index: false
      t.date :day, null: false
      t.bigint :total_seconds, null: false, default: 0
      t.bigint :linked_seconds, null: false, default: 0
      t.timestamps
    end
    add_index :hackatime_daily_totals, %i[user_id day], unique: true
    add_index :hackatime_daily_totals, :day
  end
end
