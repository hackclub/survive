class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.string :repo_link
      t.string :demo_link
      t.integer :status, default: 0, null: false

      t.timestamps
    end

    add_index :projects, :status
  end
end
