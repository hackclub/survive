class OverviewPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end
end
