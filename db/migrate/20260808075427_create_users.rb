class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :hca_id, null: false
      t.text :hca_token
      t.string :email, null: false
      t.string :display_name, null: false
      t.string :avatar
      t.string :slack_id
      t.string :verification_status
      t.boolean :is_adult, null: false, default: false
      t.boolean :is_banned, null: false, default: false
      t.string :roles, array: true, null: false, default: []

      t.timestamps
    end

    add_index :users, :hca_id, unique: true
    add_index :users, :email, unique: true
    add_index :users, :slack_id
    add_index :users, :roles, using: :gin
  end
end
