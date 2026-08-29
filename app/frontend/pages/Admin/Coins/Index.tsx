import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { SkeletonTableRows } from "../../../components/Skeleton"
import { useVisiting } from "../../../lib/useVisiting"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status } from "../../../components/Status"
import type { Pagination } from "../../../types"

type Row = {
  id: number
  name: string
  email: string
  banned: boolean
  earned: number
  adjusted: number
  balance: number
  spendable: number
}

export default function Index({
  users,
  query,
  totals,
  pagination,
}: {
  users: Row[]
  query: string
  totals: { earned: number; adjusted: number }
  pagination: Pagination
}) {
  const [search, setSearch] = useState(query)

  const visiting = useVisiting()

  return (
    <>
      <Head title="Wood - Survive" />

      <AdminSidebarLayout
        eyebrow="Payouts"
        title="Wood"
        actions={
          <span className="u-sm u-mono" style={{ color: "rgba(232, 230, 223, 0.55)" }}>
            {totals.earned} earned · {totals.adjusted} adjusted
          </span>
        }
      >
        <form
          className="dashboard__search"
          onSubmit={(e) => {
            e.preventDefault()
            router.get("/admin/coins", { q: search })
          }}
        >
          <input
            className="field__input"
            type="search"
            value={search}
            placeholder="Name or email"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn--quiet btn--sm" type="submit">
            Search
          </button>
        </form>

        <div className="data-table__wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Maker</th>
                <th className="data-table__num">Earned</th>
                <th className="data-table__num">Adjusted</th>
                <th className="data-table__num">Balance</th>
                <th className="data-table__num">Spendable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visiting && <SkeletonTableRows columns={6} rows={6} />}
              {(visiting ? [] : users).map((row) => (
                <tr key={row.id} className={row.banned ? "data-table__row--flagged" : undefined}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{row.name}</div>
                    <div className="u-xs u-faint">{row.email}</div>
                  </td>
                  <td className="data-table__num u-mono">{row.earned}</td>
                  <td className="data-table__num u-mono">{row.adjusted === 0 ? "—" : row.adjusted}</td>
                  <td className="data-table__num u-mono" style={{ fontWeight: 700 }}>
                    {row.balance}
                  </td>
                  <td className="data-table__num">
                    {row.banned ? (
                      <Status tone="bad">Frozen</Status>
                    ) : (
                      <span className="u-mono">{row.spendable}</span>
                    )}
                  </td>
                  <td className="data-table__num">
                    <Link className="btn btn--ghost btn--sm" href={`/admin/coins/${row.id}`}>
                      Ledger
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="dashboard__pagination">
            <span className="u-sm u-faint u-mono">
              Page {pagination.page} of {pagination.pages} · {pagination.count} makers
            </span>
          </div>
        )}
      </AdminSidebarLayout>
    </>
  )
}
