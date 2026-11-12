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

ActiveRecord::Schema[8.1].define(version: 2026_11_12_200000) do
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

  create_table "coin_adjustments", force: :cascade do |t|
    t.bigint "actor_id"
    t.integer "amount", null: false
    t.datetime "created_at", null: false
    t.text "reason", null: false
    t.bigint "user_id", null: false
    t.index ["actor_id"], name: "index_coin_adjustments_on_actor_id"
    t.index ["created_at"], name: "index_coin_adjustments_on_created_at"
    t.index ["user_id"], name: "index_coin_adjustments_on_user_id"
  end

  create_table "coin_payouts", force: :cascade do |t|
    t.integer "coins", null: false
    t.datetime "created_at", null: false
    t.datetime "granted_at", null: false
    t.integer "net_minutes", null: false
    t.bigint "project_id", null: false
    t.integer "rate_per_hour", null: false
    t.bigint "review_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["project_id"], name: "index_coin_payouts_on_project_id"
    t.index ["review_id"], name: "index_coin_payouts_on_review_id", unique: true
    t.index ["user_id"], name: "index_coin_payouts_on_user_id"
  end

  create_table "docs", force: :cascade do |t|
    t.text "body", default: "", null: false
    t.datetime "created_at", null: false
    t.integer "position", default: 0, null: false
    t.boolean "published", default: true, null: false
    t.string "slug", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "updated_by_id"
    t.index ["published", "position"], name: "index_docs_on_published_and_position"
    t.index ["slug"], name: "index_docs_on_slug", unique: true
    t.index ["updated_by_id"], name: "index_docs_on_updated_by_id"
  end

  create_table "final_reviews", force: :cascade do |t|
    t.datetime "claimed_at"
    t.bigint "claimed_by_id"
    t.datetime "created_at", null: false
    t.datetime "decided_at"
    t.text "decision_note"
    t.integer "deduction_minutes"
    t.integer "flags", default: 0, null: false
    t.bigint "review_id", null: false
    t.bigint "reviewer_id"
    t.jsonb "signals", default: {}, null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["claimed_at"], name: "index_final_reviews_on_claimed_at"
    t.index ["claimed_by_id"], name: "index_final_reviews_on_claimed_by_id"
    t.index ["review_id"], name: "index_final_reviews_on_review_id", unique: true
    t.index ["reviewer_id"], name: "index_final_reviews_on_reviewer_id"
    t.index ["status"], name: "index_final_reviews_on_status"
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

  create_table "hike_grant_contributions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "hike_grant_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.integer "wood", null: false
    t.index ["hike_grant_id"], name: "index_hike_grant_contributions_on_hike_grant_id"
    t.index ["user_id"], name: "index_hike_grant_contributions_on_user_id"
    t.check_constraint "wood > 0", name: "hike_grant_contributions_wood_positive"
  end

  create_table "hike_grant_items", force: :cascade do |t|
    t.integer "amount_cents", null: false
    t.datetime "created_at", null: false
    t.bigint "hike_grant_id", null: false
    t.string "kind", null: false
    t.text "reason", null: false
    t.datetime "updated_at", null: false
    t.index ["hike_grant_id"], name: "index_hike_grant_items_on_hike_grant_id"
  end

  create_table "hike_grant_participants", force: :cascade do |t|
    t.integer "allocation_cents", null: false
    t.datetime "created_at", null: false
    t.string "hcb_grant_id"
    t.string "hcb_grant_url"
    t.bigint "hike_grant_id", null: false
    t.datetime "issued_at"
    t.text "notes"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.integer "wood_cost", default: 0, null: false
    t.index ["hike_grant_id", "user_id"], name: "index_hike_grant_participants_on_grant_and_user", unique: true
    t.index ["hike_grant_id"], name: "index_hike_grant_participants_on_hike_grant_id"
    t.index ["user_id"], name: "index_hike_grant_participants_on_user_id"
  end

  create_table "hike_grants", force: :cascade do |t|
    t.integer "budget_cents", null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.bigint "created_by_id", null: false
    t.text "decision_reason"
    t.string "meeting_point", null: false
    t.string "name", null: false
    t.text "notes"
    t.datetime "paid_at"
    t.string "region", null: false
    t.datetime "reviewed_at"
    t.bigint "reviewed_by_id"
    t.datetime "starts_at", null: false
    t.integer "status", default: 0, null: false
    t.string "trail", null: false
    t.datetime "updated_at", null: false
    t.integer "visibility", default: 0, null: false
    t.integer "wood_needed", default: 0, null: false
    t.index ["created_by_id"], name: "index_hike_grants_on_created_by_id"
    t.index ["reviewed_by_id"], name: "index_hike_grants_on_reviewed_by_id"
    t.index ["status"], name: "index_hike_grants_on_status"
    t.index ["visibility"], name: "index_hike_grants_on_visibility"
  end

  create_table "orders", force: :cascade do |t|
    t.decimal "amount_usd", precision: 10, scale: 2
    t.datetime "claimed_at"
    t.bigint "claimed_by_id"
    t.datetime "created_at", null: false
    t.bigint "fraud_related_project_id"
    t.text "frozen_address"
    t.integer "frozen_coin_cost", null: false
    t.string "frozen_item_name", null: false
    t.datetime "fulfilled_at"
    t.bigint "fulfilled_by_id"
    t.string "hcb_grant_link"
    t.integer "kind", default: 0, null: false
    t.integer "quantity", default: 1, null: false
    t.string "region"
    t.text "rejection_reason"
    t.text "review_notes"
    t.datetime "reviewed_at"
    t.bigint "reviewer_id"
    t.bigint "shop_item_id"
    t.integer "state", default: 0, null: false
    t.string "tracking_number"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["claimed_by_id"], name: "index_orders_on_claimed_by_id"
    t.index ["fraud_related_project_id"], name: "index_orders_on_fraud_related_project_id"
    t.index ["fulfilled_by_id"], name: "index_orders_on_fulfilled_by_id"
    t.index ["reviewer_id"], name: "index_orders_on_reviewer_id"
    t.index ["shop_item_id"], name: "index_orders_on_shop_item_id"
    t.index ["state"], name: "index_orders_on_state"
    t.index ["user_id", "state"], name: "index_orders_on_user_id_and_state"
    t.index ["user_id"], name: "index_orders_on_user_id"
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
    t.text "airtable_error"
    t.string "airtable_record_id"
    t.datetime "airtable_synced_at"
    t.integer "approved_minutes"
    t.string "ari_decision"
    t.string "ari_phase"
    t.string "ari_reviewer_email"
    t.string "ari_reviewer_slack_id"
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
    t.boolean "test_submission", default: false, null: false
    t.datetime "updated_at", null: false
    t.index ["airtable_record_id"], name: "index_reviews_on_airtable_record_id", unique: true
    t.index ["ari_phase"], name: "index_reviews_on_ari_phase"
    t.index ["ari_ship_id"], name: "index_reviews_on_ari_ship_id", unique: true
    t.index ["project_id", "round"], name: "index_reviews_on_project_id_and_round", unique: true
    t.index ["reviewer_id"], name: "index_reviews_on_reviewer_id"
    t.index ["state"], name: "index_reviews_on_state"
  end

  create_table "shop_item_regions", force: :cascade do |t|
    t.integer "coin_cost"
    t.datetime "created_at", null: false
    t.boolean "enabled", default: true, null: false
    t.string "region", null: false
    t.bigint "shop_item_id", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_item_id", "region"], name: "index_shop_item_regions_on_shop_item_id_and_region", unique: true
  end

  create_table "shop_items", force: :cascade do |t|
    t.integer "coin_cost", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "enabled", default: true, null: false
    t.boolean "featured", default: false, null: false
    t.decimal "grant_amount_usd", precision: 10, scale: 2
    t.decimal "internal_price_usd", precision: 10, scale: 2
    t.integer "kind", default: 0, null: false
    t.integer "max_quantity"
    t.integer "min_approved_hours"
    t.string "name", null: false
    t.boolean "one_per_person", default: false, null: false
    t.integer "stock"
    t.datetime "updated_at", null: false
    t.index ["enabled"], name: "index_shop_items_on_enabled"
    t.index ["featured"], name: "index_shop_items_on_featured"
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.bigint "channel_hash", null: false
    t.datetime "created_at", null: false
    t.binary "payload", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.datetime "created_at", null: false
    t.binary "key", null: false
    t.bigint "key_hash", null: false
    t.binary "value", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
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
  add_foreign_key "coin_adjustments", "users"
  add_foreign_key "coin_adjustments", "users", column: "actor_id"
  add_foreign_key "coin_payouts", "projects"
  add_foreign_key "coin_payouts", "reviews"
  add_foreign_key "coin_payouts", "users"
  add_foreign_key "docs", "users", column: "updated_by_id"
  add_foreign_key "final_reviews", "reviews"
  add_foreign_key "final_reviews", "users", column: "claimed_by_id"
  add_foreign_key "final_reviews", "users", column: "reviewer_id"
  add_foreign_key "hackatime_projects", "projects"
  add_foreign_key "hackatime_projects", "users"
  add_foreign_key "hike_grant_contributions", "hike_grants"
  add_foreign_key "hike_grant_contributions", "users"
  add_foreign_key "hike_grant_items", "hike_grants"
  add_foreign_key "hike_grant_participants", "hike_grants"
  add_foreign_key "hike_grant_participants", "users"
  add_foreign_key "hike_grants", "users", column: "created_by_id"
  add_foreign_key "hike_grants", "users", column: "reviewed_by_id"
  add_foreign_key "orders", "projects", column: "fraud_related_project_id"
  add_foreign_key "orders", "shop_items"
  add_foreign_key "orders", "users"
  add_foreign_key "orders", "users", column: "claimed_by_id"
  add_foreign_key "orders", "users", column: "fulfilled_by_id"
  add_foreign_key "orders", "users", column: "reviewer_id"
  add_foreign_key "project_events", "projects"
  add_foreign_key "project_events", "users", column: "actor_id"
  add_foreign_key "projects", "users"
  add_foreign_key "reviews", "projects"
  add_foreign_key "reviews", "users", column: "reviewer_id"
  add_foreign_key "shop_item_regions", "shop_items"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "users", "users", column: "banned_by_id"
end
