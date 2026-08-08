class HackatimeProject < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true

  validates :name, presence: true
  validates :name, uniqueness: { scope: :user_id }

  def self.link(user:, project:, name:)
    record = find_or_initialize_by(user: user, name: name)
    return record if record.persisted? && record.project_id.present? && record.project_id != project.id

    record.project = project
    record.save
    record
  rescue ActiveRecord::RecordNotUnique
    find_by(user: user, name: name)
  end
end
