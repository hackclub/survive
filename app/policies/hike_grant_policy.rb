class HikeGrantPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  def manage?
    user&.admin?
  end
end
