class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.references :project, null: false, foreign_key: true, index: false
      t.integer :round, null: false
      t.integer :state, null: false, default: 0
      t.references :reviewer, null: true, foreign_key: { to_table: :users }
      t.references :claimed_by, null: true, foreign_key: { to_table: :users }
      t.datetime :claimed_at
      t.datetime :decided_at
      t.text :maker_feedback
      t.text :reviewer_notes
      t.integer :claimed_seconds, null: false, default: 0
      t.integer :approved_minutes
      t.jsonb :checks
      t.datetime :checks_run_at

      t.timestamps
    end

    add_index :reviews, [ :project_id, :round ], unique: true
    add_index :reviews, :state
    add_index :reviews, :claimed_at
  end
end
