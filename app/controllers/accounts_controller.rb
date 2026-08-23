class AccountsController < ApplicationController
  def show
    authorize current_user, :show?, policy_class: AccountPolicy

    render inertia: "Account/Show", props: {
      maker: {
        name: current_user.display_name,
        email: current_user.email,
        hackatimeConnected: current_user.hackatime_uid.present?,
        hackatimeProjects: current_user.hackatime_projects.count,
        roles: current_user.roles,
        banned: current_user.is_banned?,
        bannedReason: current_user.banned_reason
      },
      coins: {
        earned: current_user.coins_earned,
        adjusted: current_user.coins_adjusted,
        held: current_user.coins_held,
        spendable: current_user.spendable_coins
      }
    }
  end
end
