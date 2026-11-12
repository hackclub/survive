class AddCostItemsAndWoodToHikeGrants < ActiveRecord::Migration[8.1]
  def change
    create_table :hike_grant_items do |t|
      t.references :hike_grant, null: false, foreign_key: true
      t.string :kind, null: false
      t.integer :amount_cents, null: false
      t.text :reason, null: false
      t.timestamps
    end

    # Wood held from each hiker for their share: held while pending, spent once approved,
    # freed if the hike is rejected or the hiker is cancelled.
    add_column :hike_grant_participants, :wood_cost, :integer, null: false, default: 0
  end
end
