class AddAirtableToReviews < ActiveRecord::Migration[8.0]
  def change
    add_column :reviews, :airtable_record_id, :string
    add_column :reviews, :airtable_synced_at, :datetime
    add_column :reviews, :airtable_error, :text
    add_index :reviews, :airtable_record_id, unique: true
  end
end
