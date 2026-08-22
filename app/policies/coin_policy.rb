class CoinPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  def show?
    index?
  end

  def adjust?
    index?
  end
end
