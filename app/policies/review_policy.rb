class ReviewPolicy < ApplicationPolicy
  def index?
    user&.reviewer?
  end

  def show?
    user&.reviewer? && open_record?
  end

  alias_method :skip?, :show?
  alias_method :unclaim?, :show?
  alias_method :approve?, :show?
  alias_method :reject?, :show?
  alias_method :return_to_maker?, :show?

  private

  def open_record?
    record.respond_to?(:pending?) && (record.pending? || record.in_review?)
  end
end
