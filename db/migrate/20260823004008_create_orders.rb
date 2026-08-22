class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :shop_items, :grant_amount_usd, :decimal, precision: 10, scale: 2

    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.references :shop_item, null: true, foreign_key: true
      t.integer :kind, null: false, default: 0
      t.integer :state, null: false, default: 0
      t.integer :quantity, null: false, default: 1
      t.string :region

      t.integer :frozen_coin_cost, null: false
      t.string :frozen_item_name, null: false
      t.text :frozen_address
      t.decimal :amount_usd, precision: 10, scale: 2

      t.references :claimed_by, null: true, foreign_key: { to_table: :users }
      t.datetime :claimed_at
      t.references :reviewer, null: true, foreign_key: { to_table: :users }
      t.datetime :reviewed_at
      t.text :review_notes
      t.text :rejection_reason
      t.references :fraud_related_project, null: true, foreign_key: { to_table: :projects }

      t.string :tracking_number
      t.string :hcb_grant_link
      t.datetime :fulfilled_at
      t.references :fulfilled_by, null: true, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :orders, :state
    add_index :orders, [ :user_id, :state ]
  end
end
