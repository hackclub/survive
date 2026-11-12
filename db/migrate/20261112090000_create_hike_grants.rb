class CreateHikeGrants < ActiveRecord::Migration[8.1]
  def change
    create_table :hike_grants do |t|
      t.string :name, null: false
      t.string :trail, null: false
      t.string :region, null: false
      t.string :meeting_point, null: false
      t.datetime :starts_at, null: false
      t.integer :budget_cents, null: false
      t.integer :status, null: false, default: 0
      t.text :notes
      t.text :decision_reason
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.references :reviewed_by, null: true, foreign_key: { to_table: :users }
      t.datetime :reviewed_at
      t.datetime :paid_at
      t.datetime :completed_at
      t.timestamps
    end

    add_index :hike_grants, :status

    create_table :hike_grant_participants do |t|
      t.references :hike_grant, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :allocation_cents, null: false
      t.integer :status, null: false, default: 0
      t.string :hcb_grant_id
      t.string :hcb_grant_url
      t.datetime :issued_at
      t.text :notes
      t.timestamps
    end

    add_index :hike_grant_participants, [:hike_grant_id, :user_id], unique: true, name: "index_hike_grant_participants_on_grant_and_user"
  end
end
