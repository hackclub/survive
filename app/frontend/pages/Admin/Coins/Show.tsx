import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status, Tag } from "../../../components/Status"

type Entry = {
  id: string
  at: string
  kind: "earned" | "adjusted"
  amount: number
  source: string
  detail: string | null
  actor: string | null
  running: number
}

type Maker = {
  id: number
  name: string
  email: string
  banned: boolean
  earned: number
  adjusted: number
  balance: number
  spendable: number
}

export default function Show({ maker, entries }: { maker: Maker; entries: Entry[] }) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")

  const parsed = Number.parseInt(amount, 10) || 0

  return (
    <>
      <Head title={`Coins: ${maker.name} - Survive`} />

      <AdminSidebarLayout>
        <div className="review__header">
          <div>
            <p className="review__eyebrow u-label">{maker.email}</p>
            <h1 className="review__title">{maker.name}</h1>
          </div>
          <div className="review__header-actions">
            {maker.banned && <Status tone="bad">Banned, balance frozen</Status>}
          </div>
        </div>

        <div className="mystats__grid">
          <div className="mystats__tile">
            <span className="mystats__number">{maker.earned}</span>
            <span className="u-xs u-faint">Earned</span>
          </div>
          <div className="mystats__tile">
            <span className="mystats__number">{maker.adjusted}</span>
            <span className="u-xs u-faint">Adjusted</span>
          </div>
          <div className="mystats__tile">
            <span className="mystats__number">{maker.balance}</span>
            <span className="u-xs u-faint">Balance</span>
          </div>
          <div className="mystats__tile">
            <span className="mystats__number">{maker.spendable}</span>
            <span className="u-xs u-faint">Spendable</span>
          </div>
        </div>

        <div className="review__grid" style={{ marginTop: "var(--sp-5)" }}>
          <div className="review__main">
            <div className="data-table__wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>What</th>
                    <th className="data-table__num">Coins</th>
                    <th className="data-table__num">Running</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="data-table__empty">
                        Nothing earned or adjusted yet.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="u-mono u-xs u-faint">{entry.at}</td>
                        <td>
                          <Tag tone={entry.kind === "earned" ? "ok" : "warn"}>{entry.kind}</Tag>{" "}
                          <span className="u-sm">{entry.source}</span>
                          {entry.detail && <div className="u-xs u-faint">{entry.detail}</div>}
                          {entry.actor && <div className="u-xs u-faint">by {entry.actor}</div>}
                        </td>
                        <td
                          className="data-table__num u-mono"
                          style={{ color: entry.amount < 0 ? "var(--rust-600)" : "var(--lime-700)" }}
                        >
                          {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                        </td>
                        <td className="data-table__num u-mono">{entry.running}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="review__sidebar">
            <div className="review__card">
              <h2 className="review__card-title u-h3">Adjust</h2>
              <p className="u-xs u-faint" style={{ marginBottom: "var(--sp-3)" }}>
                Payouts are never edited. A correction is a new entry, positive or negative.
              </p>
              <div className="field">
                <label className="field__label" htmlFor="amount">
                  Coins
                </label>
                <input
                  id="amount"
                  className="field__input"
                  type="number"
                  value={amount}
                  placeholder="-25"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginTop: "var(--sp-3)" }}>
                <label className="field__label" htmlFor="reason">
                  Reason
                </label>
                <textarea
                  id="reason"
                  className="field__input field__input--textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <button
                className="btn btn--primary btn--sm"
                type="button"
                style={{ marginTop: "var(--sp-3)" }}
                disabled={parsed === 0 || !reason.trim()}
                onClick={() =>
                  router.post(`/admin/coins/${maker.id}/adjust`, { amount: parsed, reason })
                }
              >
                Apply {parsed > 0 ? `+${parsed}` : parsed || ""}
              </button>
            </div>
          </aside>
        </div>
      </AdminSidebarLayout>
    </>
  )
}
