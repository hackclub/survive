module Builders
  def build_maker(**attrs)
    User.create!(
      {
        hca_id: "hca-#{SecureRandom.hex(4)}",
        email: "maker-#{SecureRandom.hex(4)}@example.test",
        display_name: "Test Maker",
        address_line1: "4 Harrow Rd",
        city: "London",
        country: "GB",
        postal_code: "N1 1AA"
      }.merge(attrs)
    )
  end

  def give_coins(user, amount, actor: nil)
    CoinAdjustment.create!(user: user, actor: actor || user, amount: amount, reason: "test")
    user.reload
  end

  def build_item(**attrs)
    ShopItem.create!(
      { name: "Item #{SecureRandom.hex(3)}", kind: :physical, coin_cost: 100, enabled: true }.merge(attrs)
    )
  end

  def build_project(user, **attrs)
    user.projects.create!({ name: "Project #{SecureRandom.hex(3)}" }.merge(attrs))
  end

  def build_review(project, **attrs)
    project.reviews.create!({ round: project.reviews.count + 1, ingest_version: 1 }.merge(attrs))
  end
end
