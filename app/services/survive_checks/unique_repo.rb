module SurviveChecks
  class UniqueRepo < Base
    def self.blocking?
      false
    end

    def self.label
      "Repository is only used once"
    end

    def call
      key = project.normalized_repo_url
      return skipped("There is no code link to compare.") if key.blank?

      others = Project.where(normalized_repo_url: key).where.not(id: project.id)
      return pass("No other Survive project uses this repository.") if others.empty?

      names = others.order(:id).limit(3).pluck(:name).to_sentence
      count = others.count

      if others.where.not(user_id: project.user_id).exists?
        fail!("#{count} other #{"project".pluralize(count)} on Survive use this repository, at least one from a different maker: #{names}.")
      else
        fail!("This maker has #{count} other #{"project".pluralize(count)} on the same repository: #{names}.")
      end
    end
  end
end
