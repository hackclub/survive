class FinalReviewPolicy < ApplicationPolicy
  def index?
    user&.fraud?
  end

  def show?
    user&.fraud?
  end

  alias_method :decide?, :show?
  alias_method :unclaim?, :show?
end
