class ReviewPolicy < ApplicationPolicy
  def index?
    user&.reviewer?
  end

  def show?
    user&.reviewer? && open_record?
  end

  private

  def open_record?
    record.respond_to?(:pending?) && (record.pending? || record.in_review?)
  end
end
