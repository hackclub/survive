class CreateShopItems < ActiveRecord::Migration[8.1]
  def change
    create_table :shop_items do |t|
      t.string :name, null: false
      t.text :description
      t.integer :kind, null: false, default: 0
      t.integer :coin_cost, null: false
      t.decimal :internal_price_usd, precision: 10, scale: 2
      t.boolean :enabled, null: false, default: true
      t.integer :max_quantity
      t.boolean :one_per_person, null: false, default: false
      t.integer :stock
      t.integer :min_approved_hours

      t.timestamps
    end

    add_index :shop_items, :enabled

    create_table :shop_item_regions do |t|
      t.references :shop_item, null: false, foreign_key: true, index: false
      t.string :region, null: false
      t.integer :coin_cost
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end

    add_index :shop_item_regions, [ :shop_item_id, :region ], unique: true
  end
end
