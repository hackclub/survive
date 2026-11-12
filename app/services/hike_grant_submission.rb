# Creating a hike and adding people to it. The budget is the sum of the listed costs, split
# evenly, and each hiker's share is held from their wood in the same transaction that checks
# they can afford it.
module HikeGrantSubmission
  module_function

  class Refused < StandardError; end

  MAX_ITEMS = 20

  def create!(organiser:, attributes:, items:, emails:)
    users = users_for!(emails)
    item_rows = build_items(items)
    budget_cents = item_rows.sum { |item| item[:amount_cents] }
    raise Refused, "That's less than a cent each. Add to the costs or invite fewer people." if budget_cents < users.size

    ActiveRecord::Base.transaction do
      grant = HikeGrant.create!(attributes.merge(budget_cents: budget_cents, status: :pending, created_by: organiser))
      item_rows.each { |row| grant.items.create!(row) }
      rebalance!(grant, users)
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
      raise Refused, "That's less than a cent each. Add to the costs or invite fewer people." if grant.budget_cents < everyone.size

      rebalance!(grant, everyone)
      new_users
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

  # Splits the budget evenly and holds each person's share in wood. Rows are locked so two
  # hikes (or a hike and a shop order) can't spend the same wood at once.
  def rebalance!(grant, users)
    User.where(id: users.map(&:id)).order(:id).lock.load
    base, remainder = grant.budget_cents.divmod(users.size)

    short = []
    users.each_with_index do |user, index|
      cents = base + (index < remainder ? 1 : 0)
      participant = grant.participants.find_or_initialize_by(user: user)
      wood = HikeGrant.wood_for(cents)
      already_held = participant.persisted? ? participant.wood_cost : 0
      short << user if user.reload.spendable_coins + already_held < wood

      participant.update!(allocation_cents: cents, wood_cost: wood)
    end

    return if short.empty?

    raise Refused, "Not enough wood for their share: #{short.map(&:email).join(", ")}. " \
      "Each person needs #{HikeGrant.wood_for(base + (remainder.positive? ? 1 : 0))} wood."
  end
end
