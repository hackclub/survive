class RemoveClaimingFieldsFromProjects < ActiveRecord::Migration[8.1]
  def change
    remove_index :projects, :claimed_at
    remove_column :projects, :claimed_at, :datetime
    remove_reference :projects, :claimed_by, foreign_key: { to_table: :users }, index: true
  end
end
