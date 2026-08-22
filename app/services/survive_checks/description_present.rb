module SurviveChecks
  class DescriptionPresent < Base
    MIN_LENGTH = 40

    def self.label
      "Description"
    end

    def call
      description = project.description.to_s.strip
      return fail!("There is no description yet. Say what the project does.") if description.blank?

      if description.length < MIN_LENGTH
        return fail!("The description is #{description.length} characters. Write at least #{MIN_LENGTH} so a reviewer knows what this is.")
      end

      pass("#{description.length} characters.")
    end
  end
end
