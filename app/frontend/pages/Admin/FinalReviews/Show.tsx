import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status, Tag } from "../../../components/Status"
import { formatMinutes } from "../../../lib/format"
import type { FinalReviewDetail } from "../../../types"

type Decision = "pass" | "deduct" | "ban"

export default function Show({ record }: { record: FinalReviewDetail }) {
  const [decision, setDecision] = useState<Decision>("pass")
  const [note, setNote] = useState("")
  const [deduction, setDeduction] = useState("0")

  const deducted = Math.max(0, Number.parseInt(deduction, 10) || 0)
  const approved = record.approvedMinutes ?? 0
  const net = decision === "deduct" ? Math.max(0, approved - deducted) : approved
  const needsNote = decision !== "pass"
  const blocked =
    (needsNote && !note.trim()) || (decision === "deduct" && (deducted <= 0 || deducted > approved))

  function submit() {
    router.post(`/admin/final_reviews/${record.id}/decide`, {
      decision,
      note,
      deduction_minutes: deducted,
    })
  }

  return (
    <>
      <Head title={`Final review: ${record.projectName} - Survive`} />

      <AdminSidebarLayout>
        <div className="review__header">
          <div>
            <p className="review__eyebrow u-label">
              Round {record.round} &middot; {record.makerName} &middot; {record.ariShipId ?? "no ship id"}
            </p>
            <h1 className="review__title">{record.projectName}</h1>
          </div>
          <div className="review__header-actions">
            <Status tone={record.status === "pending" ? "warn" : "ok"}>{record.status}</Status>
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              onClick={() => router.delete(`/admin/final_reviews/${record.id}/claim`)}
            >
              Release
            </button>
          </div>
        </div>

        <div className="review__grid">
          <div className="review__main">
            <section className="review__card">
              <h2 className="review__card-title u-h3">Signals</h2>
              {record.flags.length === 0 ? (
                <p className="u-sm u-soft">Nothing raised. Still your call.</p>
              ) : (
                <div className="signal-chips">
                  {record.flags.map((flag) => (
                    <Tag key={flag} tone="warn">
                      {flag}
                    </Tag>
                  ))}
                </div>
              )}
              <dl className="signal-list">
                {Object.entries(record.signals).map(([key, value]) => (
                  <div key={key}>
                    <dt className="u-label u-faint">{key.replace(/_/g, " ")}</dt>
                    <dd className="u-sm u-mono">{JSON.stringify(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="review__card">
              <h2 className="review__card-title u-h3">What Ari said</h2>
              <dl className="signal-list">
                <div>
                  <dt className="u-label u-faint">Audit note</dt>
                  <dd className="u-sm">{record.ariAuditNote || "None"}</dd>
                </div>
                <div>
                  <dt className="u-label u-faint">Note to maker</dt>
                  <dd className="u-sm">{record.ariNoteToMaker || "None"}</dd>
                </div>
                <div>
                  <dt className="u-label u-faint">Reviewer</dt>
                  <dd className="u-sm u-mono">{record.ariReviewer || "Unknown"}</dd>
                </div>
                <div>
                  <dt className="u-label u-faint">Breakdown</dt>
                  <dd className="u-sm u-mono">
                    {Object.entries(record.minutesBreakdown)
                      .map(([source, minutes]) => `${source} ${minutes}`)
                      .join(" · ") || "None"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="review__action-bar">
              <div className="decision-picker">
                {(["pass", "deduct", "ban"] as Decision[]).map((option) => (
                  <button
                    key={option}
                    className={`btn btn--sm ${decision === option ? "btn--primary" : "btn--ghost"}`}
                    type="button"
                    onClick={() => setDecision(option)}
                  >
                    {option === "pass" ? "Pass" : option === "deduct" ? "Deduct" : "Ban"}
                  </button>
                ))}
              </div>

              {decision === "deduct" && (
                <div className="field">
                  <label className="field__label" htmlFor="deduction">
                    Minutes to deduct, out of {approved}
                  </label>
                  <input
                    id="deduction"
                    className="field__input"
                    type="number"
                    min={1}
                    max={approved}
                    value={deduction}
                    onChange={(e) => setDeduction(e.target.value)}
                  />
                </div>
              )}

              <div className="field">
                <label className="field__label" htmlFor="note">
                  {decision === "pass" ? "Note, optional" : "Reason, required"}
                </label>
                <textarea
                  id="note"
                  className="field__input field__input--textarea"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    decision === "ban"
                      ? "This is sent on with the maker's record."
                      : "Why, in your own words."
                  }
                />
              </div>

              <div className="review__action-buttons">
                <button className="btn btn--go" type="button" disabled={blocked} onClick={submit}>
                  {decision === "ban"
                    ? `Ban ${record.makerName}`
                    : `Release ${formatMinutes(net)}`}
                </button>
              </div>
              {decision === "ban" && (
                <p className="u-xs u-faint">
                  Bans stop the maker signing in and freeze their balance. Nothing is paid out for
                  this round.
                </p>
              )}
            </section>
          </div>

          <aside className="review__sidebar">
            <div className="review__card">
              <h2 className="review__card-title u-label u-faint">Hours</h2>
              <div className="signal-list">
                <div>
                  <dt className="u-label u-faint">Ari approved</dt>
                  <dd className="u-sm u-mono">{formatMinutes(approved)}</dd>
                </div>
                <div>
                  <dt className="u-label u-faint">Releasing</dt>
                  <dd className="u-sm u-mono">{formatMinutes(net)}</dd>
                </div>
              </div>
            </div>

            <div className="review__card">
              <h2 className="review__card-title u-label u-faint">Maker</h2>
              <p className="u-sm">{record.maker.name}</p>
              <p className="u-xs u-faint">{record.maker.email}</p>
              <div className="signal-list" style={{ marginTop: "var(--sp-3)" }}>
                <div>
                  <dt className="u-label u-faint">Approved projects</dt>
                  <dd className="u-sm u-mono">{record.maker.approvedProjects}</dd>
                </div>
                <div>
                  <dt className="u-label u-faint">Rejected</dt>
                  <dd className="u-sm u-mono">{record.maker.rejectedProjects}</dd>
                </div>
                <div>
                  <dt className="u-label u-faint">Prior deductions</dt>
                  <dd className="u-sm u-mono">{record.maker.priorDeductions}</dd>
                </div>
              </div>
              {record.maker.banned && <Tag tone="bad">Already banned</Tag>}
            </div>

            <div className="review__card">
              <h2 className="review__card-title u-label u-faint">Links</h2>
              {record.repoLink && (
                <a className="u-sm u-accent" href={record.repoLink}>
                  Repository
                </a>
              )}
              <br />
              {record.demoLink && (
                <a className="u-sm u-accent" href={record.demoLink}>
                  Demo
                </a>
              )}
            </div>
          </aside>
        </div>
      </AdminSidebarLayout>
    </>
  )
}
