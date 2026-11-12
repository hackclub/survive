class CreateGalleryImages < ActiveRecord::Migration[8.1]
  def change
    create_table :gallery_images do |t|
      t.string :placement, null: false, default: "both"
      t.string :caption
      t.integer :position, null: false, default: 0
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :gallery_images, :placement
  end
end
