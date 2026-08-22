import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status, Tag } from "../../../components/Status"
import { formatMinutes } from "../../../lib/format"
import type { Pagination } from "../../../types"

type Row = {
  id: number
  name: string
  email: string
  slackId: string | null
  roles: string[]
  banned: boolean
  bannedReason: string | null
  bannedAt: string | null
  projects: number
  approvedMinutes: number
  isYou: boolean
}

export default function Index({
  users,
  roles,
  query,
  pagination,
}: {
  users: Row[]
  roles: string[]
  query: string
  pagination: Pagination
}) {
  const [search, setSearch] = useState(query)
  const [managing, setManaging] = useState<number | null>(null)
  const [reason, setReason] = useState("")

  function toggleRole(row: Row, role: string) {
    const next = row.roles.includes(role) ? row.roles.filter((r) => r !== role) : [...row.roles, role]
    router.patch(`/admin/users/${row.id}`, { roles: next, q: query })
  }

  return (
    <>
      <Head title="Users - Survive" />

      <AdminSidebarLayout>
        <div className="dashboard__header">
          <h1 className="dashboard__title">Users</h1>
        </div>

        <form
          className="dashboard__search"
          onSubmit={(e) => {
            e.preventDefault()
            router.get("/admin/users", { q: search })
          }}
        >
          <input
            className="field__input"
            type="search"
            value={search}
            placeholder="Name, email or Slack ID"
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
                <th>Roles</th>
                <th className="data-table__num">Projects</th>
                <th className="data-table__num">Approved</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className={row.banned ? "data-table__row--flagged" : undefined}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {row.name}
                      {row.isYou && <span className="u-xs u-faint"> (you)</span>}
                    </div>
                    <div className="u-xs u-faint">{row.email}</div>
                  </td>
                  <td>
                    <div className="signal-chips">
                      {roles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          className={`role-toggle${row.roles.includes(role) ? " is-on" : ""}`}
                          onClick={() => toggleRole(row, role)}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="data-table__num u-mono">{row.projects}</td>
                  <td className="data-table__num u-mono">{formatMinutes(row.approvedMinutes)}</td>
                  <td>
                    {row.banned ? (
                      <>
                        <Status tone="bad">Banned</Status>
                        <div className="u-xs u-faint">{row.bannedAt}</div>
                      </>
                    ) : (
                      <Status tone="ok">Good standing</Status>
                    )}
                  </td>
                  <td className="data-table__num">
                    {row.banned ? (
                      <button
                        className="btn btn--ghost btn--sm"
                        type="button"
                        onClick={() => router.delete(`/admin/users/${row.id}/ban`, { data: { q: query } })}
                      >
                        Lift ban
                      </button>
                    ) : (
                      !row.isYou &&
                      managing !== row.id && (
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          onClick={() => setManaging(row.id)}
                        >
                          Ban
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {users
                .filter((row) => row.id === managing)
                .map((row) => (
                  <tr key={`ban-${row.id}`}>
                    <td colSpan={6}>
                      <div className="withdraw-row">
                        <span className="u-sm u-soft">
                          Ban <strong>{row.name}</strong>. They cannot sign in, their balance is
                          frozen, and this reason is sent on with their record.
                        </span>
                        <input
                          className="field__input"
                          type="text"
                          autoFocus
                          value={reason}
                          placeholder="Why?"
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="withdraw-row__actions">
                          <button
                            className="btn btn--danger btn--sm"
                            type="button"
                            disabled={!reason.trim()}
                            onClick={() => {
                              router.post(`/admin/users/${row.id}/ban`, { reason, q: query })
                              setManaging(null)
                              setReason("")
                            }}
                          >
                            Ban
                          </button>
                          <button
                            className="btn btn--quiet btn--sm"
                            type="button"
                            onClick={() => {
                              setManaging(null)
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

        {users.some((row) => row.banned && row.bannedReason) && (
          <div className="review__card" style={{ marginTop: "var(--sp-4)" }}>
            <h2 className="review__card-title u-label u-faint">Ban reasons</h2>
            {users
              .filter((row) => row.banned && row.bannedReason)
              .map((row) => (
                <p key={row.id} className="u-sm u-soft">
                  <Tag tone="bad">{row.name}</Tag> {row.bannedReason}
                </p>
              ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="dashboard__pagination">
            <span className="u-sm u-faint u-mono">
              Page {pagination.page} of {pagination.pages} · {pagination.count} users
            </span>
          </div>
        )}
      </AdminSidebarLayout>
    </>
  )
}
