class ShopItemPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  alias_method :show?, :index?
  alias_method :create?, :index?
  alias_method :new?, :index?
  alias_method :update?, :index?
  alias_method :edit?, :index?
  alias_method :destroy?, :index?
end
