import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status, Tag } from "../../../components/Status"
import { Tabs } from "../../../components/Tabs"
import type { FilterTab, Pagination } from "../../../types"

type Order = {
  id: number
  name: string
  kind: string
  state: string
  quantity: number
  coins: number
  region: string | null
  amountUsd: number | null
  makerName: string
  makerBanned: boolean
  makerBalance: number | null
  makerPriorDeductions: number | null
  addressLines: string[]
  placedAt: string
  reviewNotes: string | null
  rejectionReason: string | null
  decidable: boolean
}

const TONE: Record<string, "neutral" | "ok" | "warn" | "bad"> = {
  pending: "warn",
  approved: "warn",
  on_hold: "warn",
  rejected: "bad",
  fulfilled: "ok",
  refunded: "neutral",
}

export default function Index({
  orders,
  tabs,
  filter,
  pagination,
}: {
  orders: Order[]
  tabs: FilterTab[]
  filter: string
  pagination: Pagination
}) {
  const [open, setOpen] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")

  function decide(id: number, decision: string) {
    router.post(`/admin/orders/${id}/decide`, { decision, reason, notes }, {
      onFinish: () => {
        setOpen(null)
        setReason("")
        setNotes("")
      },
    })
  }

  return (
    <>
      <Head title="Orders - Survive" />

      <AdminSidebarLayout>
        <div className="dashboard__header">
          <h1 className="dashboard__title">Orders</h1>
        </div>

        <div style={{ marginBottom: "var(--sp-4)" }}>
          <Tabs
            items={tabs.map((tab) => ({
              label: tab.label,
              count: tab.count,
              href: `/admin/orders?filter=${tab.key}`,
              active: tab.key === filter,
            }))}
          />
        </div>

        {orders.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">Nothing here.</p>
          </div>
        ) : (
          <div className="data-table__wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Maker</th>
                  <th className="data-table__num">Coins</th>
                  <th className="data-table__num">Balance</th>
                  <th>Earned via</th>
                  <th>Region</th>
                  <th>State</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={order.makerBanned ? "data-table__row--flagged" : undefined}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.name}
                        {order.quantity > 1 && ` × ${order.quantity}`}
                      </div>
                      <div className="u-xs u-faint">
                        {order.placedAt}
                        {order.amountUsd !== null && ` · $${order.amountUsd.toFixed(2)}`}
                      </div>
                    </td>
                    <td className="u-soft">{order.makerName}</td>
                    <td className="data-table__num u-mono">{order.coins}</td>
                    <td className="data-table__num u-mono">{order.makerBalance ?? "—"}</td>
                    <td>
                      {order.makerBanned ? (
                        <Tag tone="bad">banned</Tag>
                      ) : order.makerPriorDeductions ? (
                        <Tag tone="warn">{order.makerPriorDeductions} deductions</Tag>
                      ) : (
                        <Tag tone="ok">clean</Tag>
                      )}
                    </td>
                    <td className="u-mono u-xs u-faint">{order.region ?? "—"}</td>
                    <td>
                      <Status tone={TONE[order.state] ?? "neutral"}>{order.state.replace("_", " ")}</Status>
                      {order.rejectionReason && (
                        <div className="u-xs u-faint">{order.rejectionReason}</div>
                      )}
                    </td>
                    <td className="data-table__num">
                      {order.state === "fulfilled" ? (
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          onClick={() => setOpen(open === order.id ? null : order.id)}
                        >
                          Refund
                        </button>
                      ) : (
                        order.decidable &&
                        open !== order.id && (
                          <button
                            className="btn btn--primary btn--sm"
                            type="button"
                            onClick={() => setOpen(order.id)}
                          >
                            Decide
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {orders
                  .filter((order) => order.id === open)
                  .map((order) => (
                    <tr key={`decide-${order.id}`}>
                      <td colSpan={8}>
                        <div className="order-decide">
                          {order.addressLines.length > 0 && (
                            <p className="u-sm u-soft">
                              Ships to {order.addressLines.join(", ")}
                            </p>
                          )}
                          <input
                            className="field__input"
                            type="text"
                            value={notes}
                            placeholder="Internal notes, optional"
                            onChange={(e) => setNotes(e.target.value)}
                          />
                          <input
                            className="field__input"
                            type="text"
                            value={reason}
                            placeholder="Reason, required to reject or refund"
                            onChange={(e) => setReason(e.target.value)}
                          />
                          <div className="withdraw-row__actions">
                            {order.state === "fulfilled" ? (
                              <button
                                className="btn btn--danger btn--sm"
                                type="button"
                                disabled={!reason.trim()}
                                onClick={() =>
                                  router.post(`/admin/orders/${order.id}/refund`, { reason })
                                }
                              >
                                Refund {order.coins}
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn btn--go btn--sm"
                                  type="button"
                                  onClick={() => decide(order.id, "approve")}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn--ghost btn--sm"
                                  type="button"
                                  onClick={() => decide(order.id, "hold")}
                                >
                                  Hold
                                </button>
                                <button
                                  className="btn btn--danger btn--sm"
                                  type="button"
                                  disabled={!reason.trim()}
                                  onClick={() => decide(order.id, "reject")}
                                >
                                  Reject and release {order.coins}
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn--quiet btn--sm"
                              type="button"
                              onClick={() => setOpen(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="dashboard__pagination">
            <span className="u-sm u-faint u-mono">
              Page {pagination.page} of {pagination.pages} · {pagination.count} orders
            </span>
          </div>
        )}
      </AdminSidebarLayout>
    </>
  )
}
