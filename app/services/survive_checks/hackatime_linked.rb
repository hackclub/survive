module SurviveChecks
  class HackatimeLinked < Base
    def self.label
      "Hackatime linked"
    end

    def call
      names = context.hackatime_names
      return fail!("No Hackatime project is linked. Link the one you coded this in.") if names.empty?

      minutes = context.claimed_minutes
      return fail!("The linked Hackatime project has no time logged against it yet.") if minutes.zero?

      pass("#{names.size} #{"project".pluralize(names.size)} linked, #{minutes} minutes logged.")
    end
  end
end
