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

ActiveRecord::Schema[8.1].define(version: 2026_08_08_222737) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

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
    t.string "repo_link"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["status"], name: "index_projects_on_status"
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "address_line1"
    t.string "address_line2"
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
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["hackatime_uid"], name: "index_users_on_hackatime_uid", unique: true
    t.index ["hca_id"], name: "index_users_on_hca_id", unique: true
    t.index ["roles"], name: "index_users_on_roles", using: :gin
    t.index ["slack_id"], name: "index_users_on_slack_id"
  end

  add_foreign_key "hackatime_projects", "projects"
  add_foreign_key "hackatime_projects", "users"
  add_foreign_key "project_events", "projects"
  add_foreign_key "project_events", "users", column: "actor_id"
  add_foreign_key "projects", "users"
end
