class AddHikeMapAndMembershipStatus < ActiveRecord::Migration[8.1]
  def change
    add_column :hike_grants, :latitude, :decimal, precision: 10, scale: 7
    add_column :hike_grants, :longitude, :decimal, precision: 10, scale: 7
    add_column :hike_grant_participants, :membership_status, :integer, default: 1, null: false
    add_index :hike_grant_participants, [ :hike_grant_id, :membership_status ], name: "index_hike_participants_on_grant_and_membership"
  end
end
