class StatsPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end
end
