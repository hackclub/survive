class AddBanDetailsToUsers < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :banned_at, :datetime
    add_column :users, :banned_reason, :text
    add_reference :users, :banned_by, null: true, foreign_key: { to_table: :users }

    execute <<~SQL.squish
      UPDATE users
      SET banned_at = NOW(),
          banned_reason = 'Banned before reasons were recorded'
      WHERE is_banned = true AND banned_at IS NULL
    SQL
  end

  def down
    remove_reference :users, :banned_by, foreign_key: { to_table: :users }
    remove_column :users, :banned_reason
    remove_column :users, :banned_at
  end
end
