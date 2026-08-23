class AccountPolicy < ApplicationPolicy
  def show?
    user.present?
  end

  def update?
    user.present? && !user.is_banned?
  end
end
