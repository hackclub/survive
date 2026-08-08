class AddHackatimeFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :hackatime_uid, :string
    add_column :users, :hackatime_token, :text

    add_index :users, :hackatime_uid, unique: true
  end
end
