class OrderPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def create?
    user.present? && !user.is_banned?
  end

  def manage?
    user&.admin?
  end

  alias_method :decide?, :manage?
end
