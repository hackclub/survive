# Hikes are paid for in wood by anyone who wants to chip in, not split across the hikers.
# Each hike stores how much wood it needs, and every chip-in is a contribution row. Shares
# that were already held from hikers move across as contributions, so nobody's purse changes.
class CreateHikeGrantContributions < ActiveRecord::Migration[8.1]
  def up
    create_table :hike_grant_contributions do |t|
      t.references :hike_grant, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :wood, null: false
      t.timestamps
    end
    add_check_constraint :hike_grant_contributions, "wood > 0", name: "hike_grant_contributions_wood_positive"

    add_column :hike_grants, :wood_needed, :integer, null: false, default: 0

    execute <<~SQL
      UPDATE hike_grants SET wood_needed = CEIL(budget_cents / 100.0)::integer
    SQL

    execute <<~SQL
      INSERT INTO hike_grant_contributions (hike_grant_id, user_id, wood, created_at, updated_at)
      SELECT hike_grant_id, user_id, wood_cost, created_at, NOW()
      FROM hike_grant_participants
      WHERE wood_cost > 0 AND status IN (0, 1)
    SQL

    execute <<~SQL
      UPDATE hike_grants
      SET wood_needed = GREATEST(wood_needed, (
        SELECT COALESCE(SUM(wood), 0) FROM hike_grant_contributions c WHERE c.hike_grant_id = hike_grants.id
      ))
    SQL

    execute "UPDATE hike_grant_participants SET wood_cost = 0"
  end

  def down
    drop_table :hike_grant_contributions
    remove_column :hike_grants, :wood_needed
  end
end
