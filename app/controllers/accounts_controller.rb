class AccountsController < ApplicationController
  DETAIL_FIELDS = %i[
    birthday address_line1 address_line2 city state country postal_code phone_number
  ].freeze

  def show
    authorize current_user, :show?, policy_class: AccountPolicy

    render inertia: "Account/Show", props: props_for(current_user)
  end

  def update
    authorize current_user, :update?, policy_class: AccountPolicy

    if current_user.update(detail_params)
      redirect_to account_path, notice: "Saved your details."
    else
      redirect_to account_path, inertia: { errors: current_user.errors.messages }
    end
  end

  private

  def detail_params
    params.permit(*DETAIL_FIELDS).to_h.transform_values { |value| value.to_s.strip.presence }
  end

  def props_for(user)
    {
      maker: {
        name: user.display_name,
        email: user.email,
        hackatimeConnected: user.hackatime_uid.present?,
        hackatimeProjects: user.hackatime_projects.count,
        roles: user.roles,
        banned: user.is_banned?,
        bannedReason: user.banned_reason
      },
      details: DETAIL_FIELDS.index_with { |field| user.public_send(field).to_s }
        .transform_keys { |field| field.to_s.camelize(:lower) },
      missing: Order::REQUIRED_ADDRESS_FIELDS.keys.select { |field| user.public_send(field).blank? },
      needsBirthday: user.birthday.blank?,
      coins: {
        earned: user.coins_earned,
        adjusted: user.coins_adjusted,
        held: user.coins_held,
        spendable: user.spendable_coins
      }
    }
  end
end
