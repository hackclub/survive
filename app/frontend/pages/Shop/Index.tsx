import { Head } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import { Flash } from "../../components/Flash"
import { Status, Tag } from "../../components/Status"
import { formatMinutes } from "../../lib/format"

type Item = {
  id: number
  name: string
  description: string | null
  kind: string
  imageUrl: string | null
  coinCost: number
  stock: number | null
  onePerPerson: boolean
  minApprovedHours: number | null
  unavailableReason: string | null
  shortBy: number
}

export default function Index({
  items,
  balance,
  trueBalance,
  frozen,
  approvedMinutes,
}: {
  items: Item[]
  balance: number
  trueBalance: number
  frozen: boolean
  approvedMinutes: number
}) {
  return (
    <>
      <Head title="Shop - Survive" />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <Flash />

          <div className="dashboard__header">
            <div>
              <h1 className="dashboard__title">{balance} coins</h1>
              <p className="u-sm u-soft">
                {formatMinutes(approvedMinutes)} approved so far.
              </p>
            </div>
          </div>

          {frozen && (
            <div className="dashboard__hackatime-banner">
              <p className="u-sm u-soft">
                Your account is suspended, so your {trueBalance} coins cannot be spent.
              </p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="dashboard__empty">
              <p className="u-lead">Nothing in the shop yet. Check back.</p>
            </div>
          ) : (
            <div className="shop-grid">
              {items.map((item) => (
                <article
                  key={item.id}
                  className={`shop-card${item.unavailableReason ? " shop-card--locked" : ""}`}
                >
                  {item.imageUrl ? (
                    <img className="shop-card__image" src={item.imageUrl} alt="" />
                  ) : (
                    <div className="shop-card__image shop-card__image--placeholder" />
                  )}

                  <div className="shop-card__body">
                    <div className="shop-card__top">
                      <span className="shop-card__name">{item.name}</span>
                      <Tag tone={item.unavailableReason ? "neutral" : "ok"}>{item.coinCost}</Tag>
                    </div>

                    {item.description && (
                      <p className="u-xs u-soft shop-card__description">{item.description}</p>
                    )}

                    <div className="shop-card__meta">
                      {item.onePerPerson && <span className="u-xs u-faint">One per person</span>}
                      {item.stock !== null && item.stock > 0 && (
                        <span className="u-xs u-faint">{item.stock} left</span>
                      )}
                    </div>

                    {item.unavailableReason ? (
                      <Status>{item.unavailableReason}</Status>
                    ) : (
                      <Status tone="ok">You can afford this</Status>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="u-xs u-faint" style={{ marginTop: "var(--sp-6)" }}>
            Ordering opens soon.
          </p>
        </div>
      </main>
    </>
  )
}
