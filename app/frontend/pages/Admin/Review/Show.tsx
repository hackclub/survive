import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { formatHours, formatMinutes } from "../../../lib/format"
import type {
  HackatimeProject,
  HourVerdict,
  Project,
  ProjectEvent,
  ProjectStatus,
  ReviewHourEntry,
  SubmitterHistory,
} from "../../../types"

type EntryDraft = { approvedMinutes: string; note: string }

const VERDICT_LABEL: Record<HourVerdict, string> = {
  approved: "Approved",
  reduced: "Reduced",
  rejected: "Rejected",
}

function verdictFor(approved: number, claimedMinutes: number): HourVerdict {
  if (approved <= 0) return "rejected"
  if (approved >= claimedMinutes) return "approved"
  return "reduced"
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Approved",
  rejected: "Rejected",
  returned: "Returned",
}

const EVENT_LABEL: Record<ProjectEvent["action"], string> = {
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  returned: "Returned",
}

export default function Show({
  project,
  reviewId,
  round,
  claimedSeconds,
  hourEntries,
  hackatimeProjects,
  history,
  submitterHistory,
  skipList,
}: {
  project: Project
  reviewId: number
  round: number
  claimedSeconds: number
  hourEntries: ReviewHourEntry[]
  hackatimeProjects: HackatimeProject[]
  history: ProjectEvent[]
  submitterHistory: SubmitterHistory
  skipList: string
}) {
  const [feedback, setFeedback] = useState("")
  const [notes, setNotes] = useState("")
  const [drafts, setDrafts] = useState<Record<number, EntryDraft>>(() =>
    Object.fromEntries(
      hourEntries.map((entry) => [
        entry.id,
        { approvedMinutes: String(entry.approvedMinutes), note: entry.note ?? "" },
      ]),
    ),
  )

  function setDraft(id: number, patch: Partial<EntryDraft>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }))
  }

  const rows = hourEntries.map((entry) => {
    const draft = drafts[entry.id]
    const claimedMinutes = Math.round(entry.claimedSeconds / 60)
    const approved = Math.max(0, Number.parseInt(draft.approvedMinutes, 10) || 0)
    const verdict = verdictFor(approved, claimedMinutes)
    return { entry, draft, claimedMinutes, approved, verdict }
  })

  const claimedTotal = Math.round(claimedSeconds / 60)
  const approvedTotal = rows.reduce((sum, row) => sum + row.approved, 0)
  const deflated = Math.max(0, claimedTotal - approvedTotal)
  const approvedShare = claimedTotal > 0 ? (approvedTotal / claimedTotal) * 100 : 0
  const missingNote = rows.some((row) => row.verdict !== "approved" && !row.draft.note.trim())
  const cannotDecide = !feedback.trim() || missingNote
  const cannotApprove = cannotDecide || !notes.trim()

  function unclaim() {
    router.delete(`/admin/review/${reviewId}/claim`)
  }

  function skip() {
    router.post(`/admin/review/${reviewId}/skip`, { skip: skipList })
  }

  function decide(action: "approve" | "reject" | "return") {
    const entries = Object.fromEntries(
      rows.map((row) => [
        row.entry.id,
        { approved_minutes: row.approved, verdict: row.verdict, note: row.draft.note },
      ]),
    )
    router.post(`/admin/review/${reviewId}/${action}`, {
      feedback,
      reviewer_notes: notes,
      entries,
    })
  }

  const totalHours = hackatimeProjects.reduce((sum, hp) => sum + hp.seconds, 0)

  return (
    <>
      <Head title={`Review: ${project.name} - Survive`} />

      <AdminSidebarLayout>
        <div className="review">
          <div className="review__header">
            <div>
              <p className="review__eyebrow u-label">Reviewing &middot; round {round}</p>
              <h1 className="review__title">{project.name}</h1>
            </div>
            <div className="review__header-actions">
              <span className={`dashboard__status dashboard__status--${project.status}`}>
                {STATUS_LABEL[project.status]}
              </span>
              <button className="btn btn--ghost btn--sm" type="button" onClick={skip}>
                Skip
              </button>
              <button className="btn btn--ghost btn--sm" type="button" onClick={unclaim}>
                Unclaim
              </button>
            </div>
          </div>

          <div className="review__grid">
            <div className="review__main">
              {project.bannerUrl && (
                <div className="project-banner">
                  <img className="banner-upload__image" src={project.bannerUrl} alt="" />
                </div>
              )}

              {project.description && (
                <p className="review__description u-lead u-soft">{project.description}</p>
              )}

              <div className="review__links">
                {project.repoLink && (
                  <a className="review__link-chip" href={project.repoLink}>
                    <span className="u-label">Repo</span>
                    <span className="u-sm">{project.repoLink}</span>
                  </a>
                )}
                {project.demoLink && (
                  <a className="review__link-chip" href={project.demoLink}>
                    <span className="u-label">Demo</span>
                    <span className="u-sm">{project.demoLink}</span>
                  </a>
                )}
                <div className="review__link-chip">
                  <span className="u-label">Hackatime</span>
                  {hackatimeProjects.length === 0 ? (
                    <span className="u-sm u-faint">Not linked</span>
                  ) : (
                    <span className="u-sm">
                      {formatHours(totalHours)}
                      {hackatimeProjects.length > 1 && ` across ${hackatimeProjects.length} projects`}
                    </span>
                  )}
                </div>
              </div>

              {hourEntries.length > 0 && (
                <div className="ledger">
                  <div className="ledger__head">
                    <h2 className="u-h3">Hours</h2>
                    <span className="u-xs u-faint u-mono">snapshotted at claim</span>
                  </div>

                  <table className="ledger__table">
                    <thead>
                      <tr>
                        <th>Hackatime project</th>
                        <th className="ledger__num">Claimed</th>
                        <th className="ledger__num">Approve</th>
                        <th>Verdict</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ entry, draft, claimedMinutes, verdict }) => (
                        <tr key={entry.id}>
                          <td className="u-mono">{entry.name}</td>
                          <td className="ledger__num u-mono u-faint">{formatMinutes(claimedMinutes)}</td>
                          <td className="ledger__num">
                            <input
                              className="ledger__input"
                              type="number"
                              min={0}
                              max={claimedMinutes}
                              value={draft.approvedMinutes}
                              aria-label={`Approved minutes for ${entry.name}`}
                              onChange={(e) => setDraft(entry.id, { approvedMinutes: e.target.value })}
                            />
                          </td>
                          <td>
                            <span className={`ledger__verdict ledger__verdict--${verdict}`}>
                              {VERDICT_LABEL[verdict]}
                            </span>
                          </td>
                          <td>
                            <input
                              className="ledger__input ledger__input--note"
                              type="text"
                              value={draft.note}
                              aria-label={`Reason for ${entry.name}`}
                              placeholder={verdict === "approved" ? "Optional" : "Required"}
                              onChange={(e) => setDraft(entry.id, { note: e.target.value })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="ledger__foot">
                    <div className="ledger__meter-wrap">
                      <div className="ledger__meter">
                        <span className="ledger__meter-fill" style={{ width: `${approvedShare}%` }} />
                      </div>
                      <span className="u-xs u-faint">
                        {Math.round(approvedShare)}% of claimed time approved
                      </span>
                    </div>
                    <dl className="ledger__totals">
                      <div>
                        <dt className="u-label u-faint">Claimed</dt>
                        <dd className="u-mono">{formatMinutes(claimedTotal)}</dd>
                      </div>
                      <div>
                        <dt className="u-label u-faint">Approved</dt>
                        <dd className="u-mono ledger__approved">{formatMinutes(approvedTotal)}</dd>
                      </div>
                      <div>
                        <dt className="u-label u-faint">Deflation</dt>
                        <dd className="u-mono ledger__deflated">{formatMinutes(deflated)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              <div className="review__action-bar">
                <div className="field">
                  <label className="field__label" htmlFor="feedback">
                    Feedback for the maker
                  </label>
                  <textarea
                    id="feedback"
                    className="field__input field__input--textarea"
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What did you change and why? Written to the person who built it."
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="reviewer-notes">
                    Assessment for the YSWS grant team
                  </label>
                  <textarea
                    id="reviewer-notes"
                    className="field__input field__input--textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Why does this project meet the bar? Required to approve."
                  />
                </div>
                <div className="review__action-buttons">
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={cannotApprove}
                    onClick={() => decide("approve")}
                  >
                    Approve {formatMinutes(approvedTotal)}
                  </button>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    disabled={cannotDecide}
                    onClick={() => decide("return")}
                  >
                    Return for changes
                  </button>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    disabled={cannotDecide}
                    onClick={() => decide("reject")}
                  >
                    Reject
                  </button>
                </div>
                {missingNote && (
                  <p className="u-xs u-faint">
                    Every reduced or rejected line needs a reason. It is sent on with the review.
                  </p>
                )}
                {!missingNote && feedback.trim() && !notes.trim() && (
                  <p className="u-xs u-faint">
                    An assessment is required to approve. Rejecting does not need one.
                  </p>
                )}
              </div>
            </div>

            <aside className="review__sidebar">
              <div className="review__card">
                <h2 className="review__card-title u-label u-faint">Submitter</h2>
                <p className="u-sm">
                  {submitterHistory.approvedCount} approved, {submitterHistory.rejectedCount}{" "}
                  rejected project{submitterHistory.rejectedCount === 1 ? "" : "s"} on record.
                </p>
              </div>

              <div className="review__card">
                <h2 className="review__card-title u-label u-faint">History</h2>
                {history.length === 0 ? (
                  <p className="u-sm u-faint">No history yet.</p>
                ) : (
                  <ul className="review__timeline">
                    {history.map((event) => (
                      <li key={event.id} className="review__timeline-item">
                        <span className="u-sm">
                          {EVENT_LABEL[event.action]} by {event.actorName}
                        </span>
                        {event.feedback && (
                          <span className="u-sm u-soft">&ldquo;{event.feedback}&rdquo;</span>
                        )}
                        <span className="u-xs u-faint">{event.createdAt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>
      </AdminSidebarLayout>
    </>
  )
}
