class AuditLog < ApplicationRecord
  belongs_to :actor, class_name: "User"
  belongs_to :target, polymorphic: true, optional: true

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc) }

  before_update { raise ActiveRecord::ReadOnlyRecord, "audit logs are immutable" }
end
