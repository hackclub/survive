class CreateFinalReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :final_reviews do |t|
      t.references :review, null: false, foreign_key: true, index: { unique: true }
      t.integer :status, null: false, default: 0
      t.integer :flags, null: false, default: 0
      t.jsonb :signals, null: false, default: {}
      t.references :reviewer, null: true, foreign_key: { to_table: :users }
      t.references :claimed_by, null: true, foreign_key: { to_table: :users }
      t.datetime :claimed_at
      t.datetime :decided_at
      t.integer :deduction_minutes
      t.text :decision_note

      t.timestamps
    end

    add_index :final_reviews, :status
    add_index :final_reviews, :claimed_at
  end
end
