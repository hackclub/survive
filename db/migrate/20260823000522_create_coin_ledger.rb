class CreateCoinLedger < ActiveRecord::Migration[8.1]
  def change
    create_table :coin_payouts do |t|
      t.references :review, null: false, foreign_key: true, index: { unique: true }
      t.references :user, null: false, foreign_key: true
      t.references :project, null: false, foreign_key: true
      t.integer :net_minutes, null: false
      t.integer :rate_per_hour, null: false
      t.integer :coins, null: false
      t.datetime :granted_at, null: false

      t.timestamps
    end

    create_table :coin_adjustments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :actor, null: true, foreign_key: { to_table: :users }
      t.integer :amount, null: false
      t.text :reason, null: false
      t.datetime :created_at, null: false
    end

    add_index :coin_adjustments, :created_at
  end
end
