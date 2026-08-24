import { Head, Link } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Empty } from "../../components/Empty"
import { Status } from "../../components/Status"

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
  approved: "Being prepared",
  on_hold: "On hold",
  rejected: "Turned down",
  fulfilled: "Sent",
  refunded: "Refunded",
}

const EDGE: Record<string, string> = {
  pending: " order-row--live",
  approved: " order-row--live",
  on_hold: " order-row--live",
  rejected: " order-row--bad",
  fulfilled: " order-row--done",
  refunded: "",
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

      <AppShell
        eyebrow="Orders"
        title={held > 0 ? `${held} wood held` : "Your orders"}
        narrow
        lede={
          held > 0
            ? `${balance} spendable once these clear or are refunded.`
            : `${balance} wood spendable.`
        }
      >
        {orders.length === 0 ? (
          <Empty
            title="No orders yet"
            action={
              <Link className="btn btn--primary btn--sm" href="/shop">
                Open the shop
              </Link>
            }
          />
        ) : (
          <div className="camp__grid">
            {orders.map((order) => (
              <div key={order.id} className={`panel order-row${EDGE[order.state]}`}>
                <div className="panel__head">
                  <h2 className="panel__title">
                    {order.name}
                    {order.quantity > 1 && ` × ${order.quantity}`}
                  </h2>
                  <Status tone={TONE[order.state] ?? "neutral"}>{LABEL[order.state]}</Status>
                </div>

                <p className="u-xs u-faint">
                  Ordered {order.placedAt} · {order.coins} wood
                  {order.held && order.state !== "fulfilled" && " held"}
                  {order.amountUsd !== null && ` · $${order.amountUsd.toFixed(2)}`}
                </p>

                {order.addressLines.length > 0 && order.state !== "rejected" && (
                  <p className="u-xs u-faint">Ships to {order.addressLines.join(", ")}</p>
                )}

                {order.trackingNumber && (
                  <p className="u-sm u-mono" style={{ marginTop: "var(--sp-2)" }}>
                    {order.trackingNumber}
                  </p>
                )}

                {order.grantLink && (
                  <a
                    className="u-sm u-accent"
                    href={order.grantLink}
                    style={{ marginTop: "var(--sp-2)", display: "inline-block" }}
                  >
                    Open your grant
                  </a>
                )}

                {order.rejectionReason && (
                  <p className="u-xs u-soft" style={{ marginTop: "var(--sp-2)" }}>
                    {order.rejectionReason} <b>{order.coins} wood went back to your purse.</b>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </AppShell>
    </>
  )
}
