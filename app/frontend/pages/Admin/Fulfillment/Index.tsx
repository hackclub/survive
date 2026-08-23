import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Tag } from "../../../components/Status"
import type { Pagination } from "../../../types"

type Order = {
  id: number
  name: string
  kind: string
  quantity: number
  region: string | null
  amountUsd: number | null
  makerName: string
  makerEmail: string
  addressLines: string[]
  approvedAt: string | null
  placedAt: string
}

export default function Index({
  orders,
  waiting,
  pagination,
}: {
  orders: Order[]
  waiting: number
  pagination: Pagination
}) {
  const [open, setOpen] = useState<number | null>(null)
  const [reference, setReference] = useState("")

  function fulfill(id: number) {
    router.post(`/admin/fulfillment/${id}/fulfill`, { reference }, {
      onFinish: () => {
        setOpen(null)
        setReference("")
      },
    })
  }

  return (
    <>
      <Head title="Fulfillment - Survive" />

      <AdminSidebarLayout eyebrow="Shipping" title={`${waiting} to send`}>
        {orders.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">Nothing to send.</p>
          </div>
        ) : (
          <div className="data-table__wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Maker</th>
                  <th>Ships to</th>
                  <th>Region</th>
                  <th>Approved</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.name}
                        {order.quantity > 1 && ` × ${order.quantity}`}
                      </div>
                      <div className="u-xs u-faint">
                        {order.kind === "grant" ? (
                          <Tag tone="warn">grant</Tag>
                        ) : (
                          `ordered ${order.placedAt}`
                        )}
                        {order.amountUsd !== null && ` $${order.amountUsd.toFixed(2)}`}
                      </div>
                    </td>
                    <td>
                      <div className="u-soft">{order.makerName}</div>
                      <div className="u-xs u-faint">{order.makerEmail}</div>
                    </td>
                    <td className="u-sm u-soft">
                      {order.addressLines.length > 0 ? order.addressLines.join(", ") : "No address needed"}
                    </td>
                    <td className="u-mono u-xs u-faint">{order.region ?? "-"}</td>
                    <td className="u-xs u-faint">{order.approvedAt ?? "-"}</td>
                    <td className="data-table__num">
                      {open !== order.id && (
                        <button
                          className="btn btn--primary btn--sm"
                          type="button"
                          onClick={() => setOpen(order.id)}
                        >
                          Mark sent
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders
                  .filter((order) => order.id === open)
                  .map((order) => (
                    <tr key={`send-${order.id}`}>
                      <td colSpan={6}>
                        <div className="order-decide">
                          <input
                            className="field__input"
                            type="text"
                            value={reference}
                            placeholder={
                              order.kind === "grant"
                                ? "HCB grant link, optional"
                                : "Tracking number, optional"
                            }
                            onChange={(e) => setReference(e.target.value)}
                          />
                          <div className="withdraw-row__actions">
                            <button
                              className="btn btn--go btn--sm"
                              type="button"
                              onClick={() => fulfill(order.id)}
                            >
                              Mark sent
                            </button>
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
