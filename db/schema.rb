# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_22_224706) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "ari_deliveries", force: :cascade do |t|
    t.string "delivery_id", null: false
    t.text "error"
    t.string "event", null: false
    t.string "external_id"
    t.jsonb "payload", default: {}, null: false
    t.datetime "processed_at"
    t.datetime "received_at", null: false
    t.bigint "review_id"
    t.index ["delivery_id"], name: "index_ari_deliveries_on_delivery_id", unique: true
    t.index ["received_at"], name: "index_ari_deliveries_on_received_at"
    t.index ["review_id"], name: "index_ari_deliveries_on_review_id"
  end

  create_table "audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.bigint "actor_id", null: false
    t.datetime "created_at", null: false
    t.jsonb "metadata", default: {}, null: false
    t.bigint "target_id"
    t.string "target_type"
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["actor_id"], name: "index_audit_logs_on_actor_id"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
    t.index ["target_type", "target_id"], name: "index_audit_logs_on_target"
  end

  create_table "hackatime_projects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "project_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["project_id"], name: "index_hackatime_projects_on_project_id"
    t.index ["user_id", "name"], name: "index_hackatime_projects_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_hackatime_projects_on_user_id"
  end

  create_table "project_events", force: :cascade do |t|
    t.integer "action", null: false
    t.bigint "actor_id", null: false
    t.datetime "created_at", null: false
    t.text "feedback"
    t.bigint "project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["action"], name: "index_project_events_on_action"
    t.index ["actor_id"], name: "index_project_events_on_actor_id"
    t.index ["project_id"], name: "index_project_events_on_project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "demo_link"
    t.text "description"
    t.string "name", null: false
    t.string "normalized_repo_url"
    t.string "repo_link"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["normalized_repo_url"], name: "index_projects_on_normalized_repo_url"
    t.index ["status"], name: "index_projects_on_status"
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.integer "approved_minutes"
    t.string "ari_decision"
    t.string "ari_phase"
    t.string "ari_ship_id"
    t.jsonb "checks"
    t.datetime "checks_run_at"
    t.datetime "created_at", null: false
    t.datetime "decided_at"
    t.text "ingest_error"
    t.integer "ingest_version", default: 1, null: false
    t.datetime "ingested_at"
    t.jsonb "justification"
    t.text "maker_feedback"
    t.jsonb "minutes_breakdown"
    t.bigint "project_id", null: false
    t.bigint "reviewer_id"
    t.text "reviewer_notes"
    t.integer "round", null: false
    t.integer "state", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["ari_phase"], name: "index_reviews_on_ari_phase"
    t.index ["ari_ship_id"], name: "index_reviews_on_ari_ship_id", unique: true
    t.index ["project_id", "round"], name: "index_reviews_on_project_id_and_round", unique: true
    t.index ["reviewer_id"], name: "index_reviews_on_reviewer_id"
    t.index ["state"], name: "index_reviews_on_state"
  end

  create_table "users", force: :cascade do |t|
    t.string "address_line1"
    t.string "address_line2"
    t.datetime "banned_at"
    t.bigint "banned_by_id"
    t.text "banned_reason"
    t.date "birthday"
    t.string "city"
    t.string "country"
    t.datetime "created_at", null: false
    t.string "display_name", null: false
    t.string "email", null: false
    t.string "first_name"
    t.text "hackatime_token"
    t.string "hackatime_uid"
    t.string "hca_id", null: false
    t.text "hca_token"
    t.boolean "is_adult", default: false, null: false
    t.boolean "is_banned", default: false, null: false
    t.string "last_name"
    t.string "phone_number"
    t.string "postal_code"
    t.string "roles", default: [], null: false, array: true
    t.string "slack_id"
    t.string "state"
    t.datetime "updated_at", null: false
    t.string "verification_status"
    t.index ["banned_by_id"], name: "index_users_on_banned_by_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["hackatime_uid"], name: "index_users_on_hackatime_uid", unique: true
    t.index ["hca_id"], name: "index_users_on_hca_id", unique: true
    t.index ["roles"], name: "index_users_on_roles", using: :gin
    t.index ["slack_id"], name: "index_users_on_slack_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "ari_deliveries", "reviews"
  add_foreign_key "audit_logs", "users", column: "actor_id"
  add_foreign_key "hackatime_projects", "projects"
  add_foreign_key "hackatime_projects", "users"
  add_foreign_key "project_events", "projects"
  add_foreign_key "project_events", "users", column: "actor_id"
  add_foreign_key "projects", "users"
  add_foreign_key "reviews", "projects"
  add_foreign_key "reviews", "users", column: "reviewer_id"
  add_foreign_key "users", "users", column: "banned_by_id"
end
