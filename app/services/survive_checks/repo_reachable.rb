module SurviveChecks
  class RepoReachable < Base
    def self.label
      "Code link works"
    end

    def call
      url = project.repo_link
      return fail!("There is no code link yet. Add the repository so a reviewer can read it.") if url.blank?

      outcome = SafeHttp.reach(url, allowed_hosts: SafeHttp::GIT_HOSTS)
      return pass("Reachable, #{outcome.status} from the git host.") if outcome.reachable
      return fail!("The code link is not usable: #{outcome.blocked_reason}.") if outcome.blocked?
      return fail!("The code link returns #{outcome.status}. Check the repository is public.") if dead?(outcome.status)

      uncertain("Could not reach the git host just now, so this could not be confirmed.")
    end

    private

    def dead?(status)
      [ 404, 410 ].include?(status)
    end
  end
end
