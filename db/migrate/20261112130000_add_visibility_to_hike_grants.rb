class AddVisibilityToHikeGrants < ActiveRecord::Migration[8.1]
  def change
    add_column :hike_grants, :visibility, :integer, default: 0, null: false
    add_index :hike_grants, :visibility
  end
end
