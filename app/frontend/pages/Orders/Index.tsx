import { Head, Link } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import { Flash } from "../../components/Flash"
import { Status, Tag } from "../../components/Status"

type Order = {
  id: number
  name: string
  kind: string
  state: string
  quantity: number
  coins: number
  held: boolean
  amountUsd: number | null
  rejectionReason: string | null
  trackingNumber: string | null
  grantLink: string | null
  placedAt: string
  addressLines: string[]
}

const TONE: Record<string, "neutral" | "ok" | "warn" | "bad"> = {
  pending: "warn",
  approved: "warn",
  on_hold: "warn",
  rejected: "bad",
  fulfilled: "ok",
  refunded: "neutral",
}

const LABEL: Record<string, string> = {
  pending: "Awaiting review",
  approved: "Approved, being prepared",
  on_hold: "On hold",
  rejected: "Turned down",
  fulfilled: "Sent",
  refunded: "Refunded",
}

export default function Index({
  orders,
  balance,
  held,
}: {
  orders: Order[]
  balance: number
  held: number
}) {
  return (
    <>
      <Head title="Orders - Survive" />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <Flash />

          <div className="dashboard__header">
            <div>
              <h1 className="dashboard__title">Your orders</h1>
              <p className="u-sm u-soft">
                {balance} coins to spend{held > 0 && `, ${held} held by open orders`}.
              </p>
            </div>
            <Link className="btn btn--primary btn--sm" href="/shop">
              Shop
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="dashboard__empty">
              <p className="u-lead">You haven't ordered anything yet.</p>
              <Link className="btn btn--primary btn--sm" href="/shop">
                Browse the shop
              </Link>
            </div>
          ) : (
            <ul className="dashboard__list">
              {orders.map((order) => (
                <li key={order.id} className="dashboard__row">
                  <div className="dashboard__row-top">
                    <span className="dashboard__name">
                      {order.name}
                      {order.quantity > 1 && ` × ${order.quantity}`}
                    </span>
                    <Tag tone={order.held ? "warn" : "neutral"}>{order.coins} coins</Tag>
                    <Status tone={TONE[order.state] ?? "neutral"}>
                      {LABEL[order.state] ?? order.state}
                    </Status>
                  </div>

                  {order.rejectionReason && (
                    <p className="u-sm u-soft">
                      {order.rejectionReason} The {order.coins} coins are back in your balance.
                    </p>
                  )}

                  {order.trackingNumber && (
                    <p className="u-sm u-soft u-mono">{order.trackingNumber}</p>
                  )}

                  {order.grantLink && (
                    <a className="u-sm u-accent" href={order.grantLink}>
                      Open your grant
                    </a>
                  )}

                  <div className="dashboard__row-meta u-sm u-faint">
                    <span>Ordered {order.placedAt}</span>
                    {order.addressLines.length > 0 && <span>{order.addressLines.join(", ")}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  )
}
