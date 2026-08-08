class ReviewPolicy < ApplicationPolicy
  def index?
    user&.reviewer?
  end
end
