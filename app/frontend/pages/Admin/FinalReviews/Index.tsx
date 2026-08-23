import { Head, Link, router } from "@inertiajs/react"
import { useQueueKeys } from "../../../lib/useQueueKeys"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status, Tag } from "../../../components/Status"
import { Tabs } from "../../../components/Tabs"
import { formatMinutes } from "../../../lib/format"
import type { FilterTab, FinalReviewRow, FinalReviewStatus, Pagination } from "../../../types"

const TONE: Record<FinalReviewStatus, "neutral" | "ok" | "warn" | "bad"> = {
  pending: "warn",
  passed: "ok",
  deducted: "warn",
  banned: "bad",
  voided: "neutral",
}

export default function Index({
  rows,
  tabs,
  filter,
  pagination,
}: {
  rows: FinalReviewRow[]
  tabs: FilterTab[]
  filter: string
  pagination: Pagination
}) {
  const { cursor } = useQueueKeys({
    count: rows.length,
    onOpen: (index) => {
      const row = rows[index]
      if (row) router.get(`/admin/final_reviews/${row.id}`)
    },
    tabs: tabs.map((tab) => `/admin/final_reviews?filter=${tab.key}`),
    onTab: (href) => router.get(href),
  })

  return (
    <>
      <Head title="Final review - Survive" />

      <AdminSidebarLayout eyebrow="Payouts" title="Final review">
        <div style={{ marginBottom: "var(--sp-4)" }}>
          <Tabs
            items={tabs.map((tab) => ({
              label: tab.label,
              count: tab.count,
              href: `/admin/final_reviews?filter=${tab.key}`,
              active: tab.key === filter,
            }))}
          />
        </div>

        {rows.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">Nothing waiting.</p>
          </div>
        ) : (
          <div className="data-table__wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Maker</th>
                  <th className="data-table__num">Approved</th>
                  <th className="data-table__num">Net</th>
                  <th>Signals</th>
                  <th>Status</th>
                  <th>Waiting</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={
                      [
                        row.flags.length > 0 ? "data-table__row--flagged" : null,
                        index === cursor ? "data-table__row--cursor" : null,
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                  >
                    <td>
                      <Link className="u-accent" href={`/admin/final_reviews/${row.id}`}>
                        {row.projectName}
                      </Link>
                      <div className="u-xs u-faint">Round {row.round}</div>
                    </td>
                    <td className="u-soft">{row.makerName}</td>
                    <td className="data-table__num u-mono">
                      {row.approvedMinutes === null ? "—" : formatMinutes(row.approvedMinutes)}
                    </td>
                    <td className="data-table__num u-mono">{formatMinutes(row.netMinutes)}</td>
                    <td>
                      {row.flags.length === 0 ? (
                        <span className="u-faint u-xs">Nothing raised</span>
                      ) : (
                        <div className="signal-chips">
                          {row.flags.map((flag) => (
                            <Tag key={flag} tone="warn">
                              {flag}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <Status tone={TONE[row.status]}>{row.status}</Status>
                      {row.heldByOther && <div className="u-xs u-faint">held by someone else</div>}
                      {row.claimedByYou && <div className="u-xs u-faint">you hold this</div>}
                    </td>
                    <td className="u-faint u-xs">{row.waitingSince}</td>
                    <td className="data-table__num">
                      <button
                        className="btn btn--primary btn--sm"
                        type="button"
                        onClick={() => router.get(`/admin/final_reviews/${row.id}`)}
                      >
                        Open
                      </button>
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
              Page {pagination.page} of {pagination.pages} · {pagination.count} total
            </span>
          </div>
        )}
      </AdminSidebarLayout>
    </>
  )
}
