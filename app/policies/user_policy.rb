class UserPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  def show?
    index?
  end

  def update?
    user&.admin?
  end

  alias_method :ban?, :update?
  alias_method :unban?, :update?
end
