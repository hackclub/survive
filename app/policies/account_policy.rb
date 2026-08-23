class AccountPolicy < ApplicationPolicy
  def show?
    user.present?
  end
end
