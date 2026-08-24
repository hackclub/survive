import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Status } from "../../components/Status"

type Item = {
  id: number
  name: string
  description: string | null
  kind: string
  imageUrl: string | null
  coinCost: number
  stock: number | null
  onePerPerson: boolean
  maxQuantity: number | null
  grantAmountUsd: number | null
  unavailableReason: string | null
}

export default function Show({
  item,
  balance,
  addressLines,
  refusal,
}: {
  item: Item
  balance: number
  addressLines: string[]
  refusal: string | null
}) {
  const [quantity, setQuantity] = useState(1)
  const total = item.coinCost * quantity
  const after = balance - total
  const blocked = refusal !== null || after < 0
  const max = item.maxQuantity ?? 10

  return (
    <>
      <Head title={`${item.name} - Survive`} />

      <AppShell
        eyebrow="Shop"
        title={item.name}
        narrow
        lede={item.description ?? undefined}
        actions={
          <Link className="nav__ghost" href="/shop">
            Back to shop
          </Link>
        }
      >
        <div className="camp__pair">
          <div>
            {item.imageUrl ? (
              <img className="shop-card__image" src={item.imageUrl} alt="" />
            ) : (
              <div className="shop-card__image shop-card__image--placeholder" />
            )}

            {item.grantAmountUsd !== null && (
              <p className="u-sm u-soft" style={{ marginTop: "var(--sp-3)" }}>
                Pays out ${item.grantAmountUsd.toFixed(2)} into your HCB account.
              </p>
            )}

            {item.kind === "physical" && (
              <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>
                {addressLines.length === 0
                  ? "No address on file. Add one on Hack Club Auth before ordering."
                  : `Ships to ${addressLines.join(", ")}. The order freezes a copy, so editing it later never changes an order already placed.`}
              </p>
            )}
          </div>

          <div className="panel">
            {max !== 1 && (
              <div className="field" style={{ marginBottom: "var(--sp-3)" }}>
                <label className="field__label" htmlFor="quantity">
                  Quantity <span className="u-faint">(max {max})</span>
                </label>
                <input
                  id="quantity"
                  className="field__input"
                  type="number"
                  min={1}
                  max={max}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.min(max, Math.max(1, Number(event.target.value) || 1)))
                  }
                />
              </div>
            )}

            <div className="ledger">
              <span className="u-soft">
                {item.coinCost}
                {quantity > 1 && ` × ${quantity}`}
              </span>
              <span className="u-mono">{total}</span>
            </div>
            <div className="ledger">
              <span className="u-soft">Your purse</span>
              <span className="u-mono">{balance}</span>
            </div>
            <div className="ledger ledger--total">
              <span>Left after</span>
              <span className="u-mono" style={{ color: after < 0 ? "var(--rust-600)" : "var(--lime-700)" }}>
                {after}
              </span>
            </div>

            {refusal ? (
              <div style={{ marginTop: "var(--sp-4)" }}>
                <Status tone="bad">{refusal}</Status>
              </div>
            ) : (
              <button
                className="btn btn--primary btn--block"
                type="button"
                style={{ marginTop: "var(--sp-4)" }}
                disabled={blocked}
                onClick={() => router.post("/orders", { shop_item_id: item.id, quantity })}
              >
                Spend {total} wood
              </button>
            )}
          </div>
        </div>
      </AppShell>
    </>
  )
}
