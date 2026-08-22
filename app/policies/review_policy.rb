class ReviewPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  def show?
    index?
  end

  def withdraw?
    user&.superadmin?
  end
end
