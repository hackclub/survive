module SurviveChecks
  class MakerNotBanned < Base
    def self.label
      "Account in good standing"
    end

    def call
      if maker.is_banned?
        reason = maker.banned_reason.presence || "no reason recorded"
        return fail!("This maker is banned from Survive: #{reason}")
      end

      return fail!("Hackatime has flagged this account, so the logged time cannot be trusted.") if HackatimeSyncService.banned?(maker)

      pass("No ban on Survive or Hackatime.")
    end
  end
end
