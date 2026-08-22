class ProjectEvent < ApplicationRecord
  belongs_to :project
  belongs_to :actor, class_name: "User"

  enum :action, { submitted: 0, approved: 1, rejected: 2, returned: 3 }

  validates :feedback, presence: true, if: -> { approved? || rejected? || returned? }

  default_scope { order(created_at: :desc) }

  def as_client_json
    {
      id: id,
      action: action,
      feedback: feedback,
      actorName: actor.display_name,
      createdAt: created_at.strftime("%b %d, %Y")
    }
  end
end
