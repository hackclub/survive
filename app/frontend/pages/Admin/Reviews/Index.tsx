import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status, Tag } from "../../../components/Status"
import { Tabs } from "../../../components/Tabs"
import { formatMinutes } from "../../../lib/format"
import type { AriPhase, FilterTab, Pagination, SubmissionRow } from "../../../types"

const PHASE_TONE: Record<AriPhase, "neutral" | "ok" | "warn" | "bad" | "info"> = {
  processing: "warn",
  review: "warn",
  under_review: "warn",
  second_pass: "warn",
  reviewed: "ok",
  withdrawn: "neutral",
  reverted: "bad",
}

const DECISION_TONE: Record<string, "ok" | "warn" | "bad"> = {
  approved: "ok",
  changes: "warn",
  rejected: "bad",
}

function PhaseCell({ row }: { row: SubmissionRow }) {
  if (row.ingestError) return <Status tone="bad">Send failed</Status>
  if (!row.ingestedAt) return <Status>Not sent</Status>
  if (!row.ariPhase) return <Status tone="warn">Processing</Status>

  return (
    <Status tone={PHASE_TONE[row.ariPhase]}>
      {row.ariPhase.replace("_", " ").replace(/^./, (c) => c.toUpperCase())}
    </Status>
  )
}

export default function Index({
  reviews,
  tabs,
  filter,
  pagination,
}: {
  reviews: SubmissionRow[]
  tabs: FilterTab[]
  filter: string
  pagination: Pagination
}) {
  const [withdrawing, setWithdrawing] = useState<number | null>(null)
  const [reason, setReason] = useState("")

  function withdraw(id: number) {
    router.post(`/admin/reviews/${id}/withdraw`, { reason }, {
      onFinish: () => {
        setWithdrawing(null)
        setReason("")
      },
    })
  }

  function go(page: number) {
    router.get("/admin/reviews", { filter, page }, { preserveState: true })
  }

  return (
    <>
      <Head title="Submissions - Survive" />

      <AdminSidebarLayout>
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Submissions</h1>
          </div>
        </div>

        <div style={{ marginBottom: "var(--sp-4)" }}>
          <Tabs
            items={tabs.map((tab) => ({
              label: tab.label,
              count: tab.count,
              href: `/admin/reviews?filter=${tab.key}`,
              active: tab.key === filter,
            }))}
          />
        </div>

        {reviews.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">Nothing here.</p>
          </div>
        ) : (
          <div className="data-table__wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Maker</th>
                  <th className="data-table__num">Round</th>
                  <th>Ari phase</th>
                  <th>Decision</th>
                  <th className="data-table__num">Approved</th>
                  <th>Sent</th>
                  <th>Ship</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((row) => (
                  <tr key={row.id} className={row.stuck ? "data-table__row--flagged" : undefined}>
                    <td>
                      <Link className="u-accent" href={`/projects/${row.projectId}`}>
                        {row.projectName}
                      </Link>
                      {row.ingestError && (
                        <div className="u-xs u-soft">{row.ingestError}</div>
                      )}
                    </td>
                    <td className="u-soft">{row.makerName}</td>
                    <td className="data-table__num u-mono">{row.round}</td>
                    <td>
                      <PhaseCell row={row} />
                      {row.stuck && (
                        <div style={{ marginTop: "var(--sp-1)" }}>
                          <Tag tone="warn">Stuck</Tag>
                        </div>
                      )}
                    </td>
                    <td>
                      {row.ariDecision ? (
                        <Tag tone={DECISION_TONE[row.ariDecision] ?? "neutral"}>{row.ariDecision}</Tag>
                      ) : (
                        <span className="u-faint">&mdash;</span>
                      )}
                    </td>
                    <td className="data-table__num u-mono">
                      {row.approvedMinutes === null ? (
                        <span className="u-faint">&mdash;</span>
                      ) : (
                        formatMinutes(row.approvedMinutes)
                      )}
                    </td>
                    <td className="u-faint u-xs">
                      {row.ingestedAt ?? "not yet"}
                      {row.ingestVersion > 1 && ` · v${row.ingestVersion}`}
                    </td>
                    <td className="u-mono u-xs u-faint">{row.ariShipId ?? "—"}</td>
                    <td className="data-table__num">
                      {row.canWithdraw && withdrawing !== row.id && (
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          onClick={() => setWithdrawing(row.id)}
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reviews
                  .filter((row) => row.id === withdrawing)
                  .map((row) => (
                  <tr key={`withdraw-${row.id}`}>
                    <td colSpan={9}>
                      <div className="withdraw-row">
                        <span className="u-sm u-soft">
                          Pull <strong>{row.projectName}</strong> off Ari. The maker can fix it and
                          submit again. They will see your reason.
                        </span>
                        <input
                          className="field__input"
                          type="text"
                          autoFocus
                          value={reason}
                          placeholder="Why is this being withdrawn?"
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="withdraw-row__actions">
                          <button
                            className="btn btn--primary btn--sm"
                            type="button"
                            disabled={!reason.trim()}
                            onClick={() => withdraw(row.id)}
                          >
                            Withdraw
                          </button>
                          <button
                            className="btn btn--quiet btn--sm"
                            type="button"
                            onClick={() => {
                              setWithdrawing(null)
                              setReason("")
                            }}
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
            <button
              className="btn btn--quiet btn--sm"
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => go(pagination.page - 1)}
            >
              Prev
            </button>
            <span className="u-sm u-faint u-mono">
              Page {pagination.page} of {pagination.pages} · {pagination.count} total
            </span>
            <button
              className="btn btn--quiet btn--sm"
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => go(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </AdminSidebarLayout>
    </>
  )
}
