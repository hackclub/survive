import { Head, Link } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Empty } from "../../components/Empty"
import { SkeletonShopList } from "../../components/Skeleton"
import { useVisiting } from "../../lib/useVisiting"
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
  const visiting = useVisiting()

  return (
    <>
      <Head title="Shop - Survive" />

      <AppShell
        eyebrow="Shop"
        title={frozen ? "Spending is paused" : `${balance} wood to spend`}
        tone={frozen ? "returned" : undefined}
        wide
        lede={
          frozen
            ? `Your account is suspended, so your ${trueBalance} wood cannot be spent right now. Open orders are on hold, not cancelled.`
            : `${formatMinutes(approvedMinutes)} approved so far.`
        }
      >
        {visiting ? (
          <SkeletonShopList rows={items.length || 8} />
        ) : items.length === 0 ? (
          <Empty title="The shelves are bare" text="Nothing in the shop yet. Check back." idle />
        ) : (
          <div className="shop-grid" style={frozen ? { opacity: 0.45 } : undefined}>
            {items.map((item) => {
              const locked = item.unavailableReason !== null

              return (
                <Link
                  key={item.id}
                  href={`/shop/items/${item.id}`}
                  className={`shop-card${locked ? " shop-card--locked" : ""}`}
                >
                  {item.imageUrl ? (
                    <img className="shop-card__image" src={item.imageUrl} alt="" />
                  ) : (
                    <div className="shop-card__image shop-card__image--placeholder" />
                  )}

                  <div className="shop-card__body">
                    <span className="shop-card__name">{item.name}</span>

                    {item.description && (
                      <p className="shop-card__description">{item.description}</p>
                    )}

                    {item.onePerPerson && <span className="shop-card__note">One per person</span>}

                    {item.stock !== null && (
                      <span className="shop-card__note">{item.stock} left</span>
                    )}

                    {item.shortBy > 0 && (
                      <span className="shop-card__short">{item.shortBy} more wood</span>
                    )}

                    {locked && item.shortBy === 0 && (
                      <span className="shop-card__short shop-card__short--out">
                        {item.unavailableReason}
                      </span>
                    )}

                    <div className="shop-card__price">
                      <span className="coin" aria-hidden="true" />
                      <b>{item.coinCost}</b>
                      <span
                        className="btn btn--primary btn--sm"
                        aria-disabled={locked ? "true" : undefined}
                        style={locked ? { opacity: 0.45 } : undefined}
                      >
                        Order
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </AppShell>
    </>
  )
}
