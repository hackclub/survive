class ProjectPolicy < ApplicationPolicy
  def show?
    return true if record.approved?
    owner? || user&.reviewer?
  end

  def create?
    user.present?
  end

  def update?
    owner? && editable?
  end

  def destroy?
    owner? && editable?
  end

  def submit_for_review?
    owner? && editable?
  end

  def review?
    user&.reviewer? && record.pending?
  end

  private

  def editable?
    record.draft? || record.rejected? || record.returned?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.reviewer?
        scope.all
      else
        scope.where(user: user)
      end
    end
  end
end
