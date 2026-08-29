class CreateDocs < ActiveRecord::Migration[8.0]
  def change
    create_table :docs do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :body, null: false, default: ""
      t.integer :position, null: false, default: 0
      t.boolean :published, null: false, default: true
      t.references :updated_by, foreign_key: { to_table: :users }, null: true
      t.timestamps
    end

    add_index :docs, :slug, unique: true
    add_index :docs, [ :published, :position ]
  end
end
