class DropReviewHourEntries < ActiveRecord::Migration[8.1]
  def change
    drop_table :review_hour_entries do |t|
      t.references :review, null: false, foreign_key: true, index: false
      t.string :hackatime_name, null: false
      t.integer :claimed_seconds, null: false, default: 0
      t.integer :approved_minutes, null: false, default: 0
      t.integer :verdict, null: false, default: 0
      t.text :note

      t.timestamps

      t.index [ :review_id, :hackatime_name ], unique: true
    end

    remove_index :reviews, :claimed_at
    remove_column :reviews, :claimed_at, :datetime
    remove_reference :reviews, :claimed_by, foreign_key: { to_table: :users }, index: true
  end
end
