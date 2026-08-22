class CreateReviewHourEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :review_hour_entries do |t|
      t.references :review, null: false, foreign_key: true, index: false
      t.string :hackatime_name, null: false
      t.integer :claimed_seconds, null: false, default: 0
      t.integer :approved_minutes, null: false, default: 0
      t.integer :verdict, null: false, default: 0
      t.text :note

      t.timestamps
    end

    add_index :review_hour_entries, [ :review_id, :hackatime_name ], unique: true
  end
end
