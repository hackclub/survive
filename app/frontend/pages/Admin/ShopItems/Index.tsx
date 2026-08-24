import { Head, Link, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status, Tag } from "../../../components/Status"

type Region = { id: number; region: string; coinCost: number | null; enabled: boolean }

type Item = {
  id: number
  name: string
  kind: string
  coinCost: number
  enabled: boolean
  stock: number | null
  onePerPerson: boolean
  maxQuantity: number | null
  minApprovedHours: number | null
  imageUrl: string | null
  regions: Region[]
}

export default function Index({ items }: { items: Item[] }) {
  return (
    <>
      <Head title="Shop items - Survive" />

      <AdminSidebarLayout
        eyebrow="Payouts"
        title="Shop items"
        actions={
          <Link className="btn btn--primary btn--sm" href="/admin/shop_items/new">
            New item
          </Link>
        }
      >
        {items.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">Nothing in the shop yet.</p>
            <Link className="btn btn--primary btn--sm" href="/admin/shop_items/new">
              Add the first item
            </Link>
          </div>
        ) : (
          <div className="data-table__wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Kind</th>
                  <th className="data-table__num">Wood</th>
                  <th className="data-table__num">Stock</th>
                  <th>Limits</th>
                  <th>Regions</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.enabled ? undefined : "data-table__row--muted"}>
                    <td>
                      <div className="shop-cell">
                        {item.imageUrl && <img className="shop-cell__thumb" src={item.imageUrl} alt="" />}
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                      </div>
                    </td>
                    <td>
                      <Tag>{item.kind}</Tag>
                    </td>
                    <td className="data-table__num u-mono">{item.coinCost}</td>
                    <td className="data-table__num u-mono">{item.stock === null ? "∞" : item.stock}</td>
                    <td className="u-xs u-faint">
                      {[
                        item.onePerPerson ? "one ever" : null,
                        item.maxQuantity ? `max ${item.maxQuantity}` : null,
                        item.minApprovedHours ? `${item.minApprovedHours}h min` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "none"}
                    </td>
                    <td className="u-xs u-faint">
                      {item.regions.length === 0
                        ? "default only"
                        : item.regions.map((r) => r.region).join(", ")}
                    </td>
                    <td>
                      {item.enabled ? <Status tone="ok">Enabled</Status> : <Status>Disabled</Status>}
                    </td>
                    <td className="data-table__num">
                      <button
                        className="btn btn--ghost btn--sm"
                        type="button"
                        onClick={() => router.get(`/admin/shop_items/${item.id}/edit`)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSidebarLayout>
    </>
  )
}
