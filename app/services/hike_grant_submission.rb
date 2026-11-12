# Creating a hike, adding people to it, and paying for it. The budget is the sum of the listed
# costs, and the hike needs that much wood before it can be approved. The organiser can put
# some in when they send it, and anyone who can see the hike can chip in after that.
module HikeGrantSubmission
  module_function

  class Refused < StandardError; end

  MAX_ITEMS = 20

  def create!(organiser:, attributes:, items:, emails:, wood: 0)
    users = users_for!(emails)
    item_rows = build_items(items)
    budget_cents = item_rows.sum { |item| item[:amount_cents] }
    raise Refused, "Add to the costs or invite fewer people." if budget_cents < users.size

    ActiveRecord::Base.transaction do
      grant = HikeGrant.create!(attributes.merge(budget_cents: budget_cents, wood_needed: HikeGrant.wood_for(budget_cents),
        status: :pending, created_by: organiser))
      item_rows.each { |row| grant.items.create!(row) }
      split!(grant, users)
      contribute!(grant, organiser, wood) if wood.to_i.positive?
      grant
    end
  end

  def add_participants!(grant, emails)
    new_users = users_for!(emails)

    ActiveRecord::Base.transaction do
      grant.lock!
      raise Refused, "You can only add people before your hike is reviewed." unless grant.pending?

      existing = grant.participants.includes(:user).map(&:user)
      duplicates = new_users.select { |user| existing.include?(user) }
      raise Refused, "Already on this hike: #{duplicates.map(&:email).join(", ")}" if duplicates.any?

      everyone = existing + new_users
      raise Refused, "Add to the costs or invite fewer people." if grant.budget_cents < everyone.size

      split!(grant, everyone)
      new_users
    end
  end

  # Puts some of the user's wood toward the hike. The user and hike rows are locked so the
  # same wood can't go to two places at once, and a hike can't be overpaid.
  def contribute!(grant, user, wood)
    wood = Integer(wood.to_s, 10) rescue 0
    raise Refused, "Enter how much wood to put in." unless wood.positive?

    ActiveRecord::Base.transaction do
      grant.lock!
      User.where(id: user.id).lock.load
      raise Refused, "This hike isn't taking wood any more." unless grant.pending?

      remaining = grant.wood_remaining
      raise Refused, "This hike already has all the wood it needs." if remaining.zero?
      raise Refused, "This hike only needs #{remaining} more wood." if wood > remaining
      raise Refused, "You only have #{user.reload.spendable_coins} wood to spend." if user.reload.spendable_coins < wood

      grant.contributions.create!(user: user, wood: wood)
    end
  end

  # Gives back everything the user put in, while the hike is still waiting for review.
  def withdraw!(grant, user)
    ActiveRecord::Base.transaction do
      grant.lock!
      raise Refused, "Wood can only be taken back before the hike is reviewed." unless grant.pending?

      mine = grant.contributions.where(user: user)
      raise Refused, "You haven't put any wood into this hike." unless mine.exists?

      mine.sum(:wood).tap { mine.delete_all }
    end
  end

  def build_items(items)
    rows = Array(items).map { |item| item.to_h.with_indifferent_access }
      .reject { |item| item[:kind].blank? && item[:amount].blank? && item[:reason].blank? }
    raise Refused, "List at least one cost." if rows.empty?
    raise Refused, "That's a lot of costs. Keep it to #{MAX_ITEMS} or fewer." if rows.size > MAX_ITEMS

    rows.map do |item|
      kind = item[:kind].to_s
      raise Refused, "Pick what each cost is for." unless HikeGrantItem::KINDS.key?(kind)

      label = HikeGrantItem::KINDS.fetch(kind)[:label]
      cents = (BigDecimal(item[:amount].to_s) * 100).round
      raise Refused, "Enter how much \"#{label}\" costs." unless cents.positive?

      reason = item[:reason].to_s.strip
      if reason.length < HikeGrantItem::MIN_REASON_LENGTH
        raise Refused, "Add a sentence on why the hike needs \"#{label}\"."
      end

      { kind: kind, amount_cents: cents, reason: reason }
    rescue ArgumentError
      raise Refused, "Enter how much \"#{label}\" costs."
    end
  end

  def users_for!(emails)
    raise Refused, "Add at least one person's email." if emails.empty?

    users = User.where("LOWER(email) IN (?)", emails).index_by { |user| user.email.downcase }
    missing = emails - users.keys
    raise Refused, "These emails don't have a Survive account: #{missing.join(", ")}" if missing.any?

    emails.map { |email| users.fetch(email) }
  end

  # Splits the budget evenly so each hiker's HCB grant is known. Wood is paid separately.
  def split!(grant, users)
    base, remainder = grant.budget_cents.divmod(users.size)

    users.each_with_index do |user, index|
      participant = grant.participants.find_or_initialize_by(user: user)
      participant.update!(allocation_cents: base + (index < remainder ? 1 : 0))
    end
  end
end
