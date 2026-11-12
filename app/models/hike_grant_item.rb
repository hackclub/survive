class HikeGrantItem < ApplicationRecord
  # Suggested costs shown on the form. Hints are rough USD guides, not limits.
  KINDS = {
    "fuel" => { label: "Fuel for a car lift", hint: "Roughly $0.15 a mile. A 100-mile round trip is about $15." },
    "transit" => { label: "Train or bus fares", hint: "Often $3 to $10 each way, per person." },
    "entry" => { label: "Park entry or permits", hint: "Free to about $35 per car." },
    "campsite" => { label: "Campsite fees", hint: "About $15 to $35 per site, per night." },
    "food" => { label: "Food and water", hint: "About $10 to $20 per person for the day." },
    "gear" => { label: "Gear hire", hint: "A tent or pack is often $20 to $40 a day." },
    "first_aid" => { label: "First aid kit", hint: "A basic kit is about $20 to $30." },
    "other" => { label: "Something else", hint: "Anything else the hike needs." }
  }.freeze

  MIN_REASON_LENGTH = 10

  belongs_to :hike_grant

  validates :kind, inclusion: { in: KINDS.keys }
  validates :amount_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :reason, length: { minimum: MIN_REASON_LENGTH,
    message: "needs a sentence on why the hike needs it" }

  def label
    KINDS.fetch(kind)[:label]
  end
end
