class AddFeaturedToShopItems < ActiveRecord::Migration[8.0]
  def change
    add_column :shop_items, :featured, :boolean, null: false, default: false
    add_index :shop_items, :featured
  end
end
