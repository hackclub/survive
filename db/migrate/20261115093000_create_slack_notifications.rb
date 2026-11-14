class CreateSlackNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :slack_notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :event_key, null: false
      t.datetime :sent_at

      t.timestamps
    end

    add_index :slack_notifications, [ :user_id, :event_key ], unique: true
  end
end
