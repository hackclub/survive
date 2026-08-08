class User < ApplicationRecord
  encrypts :hca_token

  validates :hca_id, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :display_name, presence: true

  def reviewer?
    roles.include?("reviewer") || admin?
  end

  def admin?
    roles.include?("admin")
  end
end
