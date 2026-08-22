import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import { Flash } from "../../components/Flash"
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

  return (
    <>
      <Head title={`${item.name} - Survive`} />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <Flash />

          <div className="dashboard__header">
            <Link className="btn btn--ghost btn--sm" href="/shop">
              Back to shop
            </Link>
          </div>

          <div className="review__grid">
            <div className="review__main">
              {item.imageUrl ? (
                <img className="shop-card__image" src={item.imageUrl} alt="" />
              ) : (
                <div className="shop-card__image shop-card__image--placeholder" />
              )}

              <div>
                <h1 className="dashboard__title">{item.name}</h1>
                {item.description && <p className="u-lead u-soft">{item.description}</p>}
                {item.grantAmountUsd !== null && (
                  <p className="u-sm u-soft">Pays out ${item.grantAmountUsd.toFixed(2)}.</p>
                )}
              </div>

              {item.kind === "physical" && (
                <section className="review__card">
                  <h2 className="review__card-title u-label u-faint">Shipping to</h2>
                  {addressLines.length === 0 ? (
                    <p className="u-sm u-soft">
                      No address on file. Add one on Hack Club Auth before ordering.
                    </p>
                  ) : (
                    <p className="u-sm">{addressLines.join(", ")}</p>
                  )}
                  <p className="u-xs u-faint" style={{ marginTop: "var(--sp-2)" }}>
                    This is copied onto the order. Changing it later will not change this order.
                  </p>
                </section>
              )}
            </div>

            <aside className="review__sidebar">
              <div className="review__card">
                <h2 className="review__card-title u-h3">Cost</h2>

                {item.maxQuantity !== 1 && (
                  <div className="field" style={{ marginBottom: "var(--sp-3)" }}>
                    <label className="field__label" htmlFor="quantity">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      className="field__input"
                      type="number"
                      min={1}
                      max={item.maxQuantity ?? 10}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>
                )}

                <div className="signal-list">
                  <div>
                    <dt className="u-label u-faint">Cost</dt>
                    <dd className="u-mono">{total}</dd>
                  </div>
                  <div>
                    <dt className="u-label u-faint">Balance now</dt>
                    <dd className="u-mono">{balance}</dd>
                  </div>
                  <div>
                    <dt className="u-label u-faint">After</dt>
                    <dd className="u-mono" style={{ fontWeight: 700 }}>
                      {after}
                    </dd>
                  </div>
                </div>

                {refusal ? (
                  <div style={{ marginTop: "var(--sp-3)" }}>
                    <Status tone="bad">{refusal}</Status>
                  </div>
                ) : (
                  <button
                    className="btn btn--primary btn--block"
                    type="button"
                    style={{ marginTop: "var(--sp-4)" }}
                    disabled={blocked}
                    onClick={() =>
                      router.post("/orders", { shop_item_id: item.id, quantity })
                    }
                  >
                    Place order
                  </button>
                )}

                <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>
                  Coins are held as soon as you order, and released if it is turned down.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
