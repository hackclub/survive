class AddClaimingFieldsToProjects < ActiveRecord::Migration[8.1]
  def change
    add_reference :projects, :claimed_by, null: true, foreign_key: { to_table: :users }
    add_column :projects, :claimed_at, :datetime

    add_index :projects, :claimed_at
  end
end
