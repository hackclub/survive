class CreateProjectEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :project_events do |t|
      t.references :project, null: false, foreign_key: true
      t.references :actor, null: false, foreign_key: { to_table: :users }
      t.integer :action, null: false
      t.text :feedback

      t.timestamps
    end

    add_index :project_events, :action
  end
end
