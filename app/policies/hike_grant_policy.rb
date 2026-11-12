class HikeGrantPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end
end
