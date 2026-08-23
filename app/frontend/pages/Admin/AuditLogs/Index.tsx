import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import type { Pagination } from "../../../types"

type Entry = {
  id: number
  action: string
  actor: string | null
  target: string | null
  metadata: Record<string, unknown>
  at: string
}

export default function Index({
  entries,
  actions,
  actors,
  filters,
  pagination,
}: {
  entries: Entry[]
  actions: string[]
  actors: { id: number; name: string }[]
  filters: { action: string; actor: string }
  pagination: Pagination
}) {
  function apply(patch: Partial<{ action_name: string; actor_id: string }>) {
    router.get("/admin/audit_logs", {
      action_name: patch.action_name ?? filters.action,
      actor_id: patch.actor_id ?? filters.actor,
    })
  }

  return (
    <>
      <Head title="Audit log - Survive" />

      <AdminSidebarLayout eyebrow="Admin" title="Audit log">
        <div className="dashboard__search">
          <select
            className="field__input"
            value={filters.action}
            onChange={(e) => apply({ action_name: e.target.value })}
          >
            <option value="">Every action</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <select
            className="field__input"
            value={filters.actor}
            onChange={(e) => apply({ actor_id: e.target.value })}
          >
            <option value="">Everyone</option>
            {actors.map((actor) => (
              <option key={actor.id} value={String(actor.id)}>
                {actor.name}
              </option>
            ))}
          </select>
        </div>

        {entries.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">Nothing recorded yet.</p>
          </div>
        ) : (
          <div className="data-table__wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="u-mono u-xs u-faint">{entry.at}</td>
                    <td className="u-soft">{entry.actor ?? "system"}</td>
                    <td className="u-mono u-xs">{entry.action}</td>
                    <td className="u-mono u-xs u-faint">{entry.target ?? "—"}</td>
                    <td className="u-xs u-soft audit-meta">
                      {Object.keys(entry.metadata).length === 0
                        ? "—"
                        : Object.entries(entry.metadata)
                            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                            .join(", ")}
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
              Page {pagination.page} of {pagination.pages} · {pagination.count} entries
            </span>
          </div>
        )}
      </AdminSidebarLayout>
    </>
  )
}
