class AddAriShipTracking < ActiveRecord::Migration[8.1]
  def change
    remove_column :reviews, :claimed_seconds, :integer, null: false, default: 0

    add_column :reviews, :ari_ship_id, :string
    add_column :reviews, :ingest_version, :integer, null: false, default: 1
    add_column :reviews, :ari_phase, :string
    add_column :reviews, :ari_decision, :string
    add_column :reviews, :minutes_breakdown, :jsonb
    add_column :reviews, :justification, :jsonb
    add_column :reviews, :ingested_at, :datetime
    add_column :reviews, :ingest_error, :text

    add_index :reviews, :ari_ship_id, unique: true
    add_index :reviews, :ari_phase

    create_table :ari_deliveries do |t|
      t.string :delivery_id, null: false
      t.string :event, null: false
      t.string :external_id
      t.references :review, null: true, foreign_key: true
      t.jsonb :payload, null: false, default: {}
      t.datetime :received_at, null: false
      t.datetime :processed_at
      t.text :error
    end

    add_index :ari_deliveries, :delivery_id, unique: true
    add_index :ari_deliveries, :received_at
  end
end
