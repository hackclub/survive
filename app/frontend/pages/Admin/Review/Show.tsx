import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { formatHours } from "../../../lib/format"
import type {
  HackatimeProject,
  Project,
  ProjectEvent,
  ProjectStatus,
  SubmitterHistory,
} from "../../../types"

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Approved",
  rejected: "Rejected",
}

const EVENT_LABEL: Record<ProjectEvent["action"], string> = {
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
}

export default function Show({
  project,
  hackatimeProjects,
  history,
  submitterHistory,
  skipList,
}: {
  project: Project
  hackatimeProjects: HackatimeProject[]
  history: ProjectEvent[]
  submitterHistory: SubmitterHistory
  skipList: string
}) {
  const [feedback, setFeedback] = useState("")

  function unclaim() {
    router.delete(`/admin/review/${project.id}/claim`)
  }

  function skip() {
    router.post(`/admin/review/${project.id}/skip`, { skip: skipList })
  }

  function decide(action: "approve" | "reject") {
    router.post(`/admin/review/${project.id}/${action}`, { feedback })
  }

  const totalHours = hackatimeProjects.reduce((sum, hp) => sum + hp.seconds, 0)

  return (
    <>
      <Head title={`Review: ${project.name} - Survive`} />

      <AdminSidebarLayout>
        <div className="review">
          <div className="review__header">
            <div>
              <p className="review__eyebrow u-label">Reviewing</p>
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

              <div className="review__action-bar">
                <div className="field">
                  <label className="field__label" htmlFor="feedback">
                    Reason (required for approve or reject)
                  </label>
                  <textarea
                    id="feedback"
                    className="field__input field__input--textarea"
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Why does this project pass or fail review?"
                  />
                </div>
                <div className="review__action-buttons">
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={!feedback.trim()}
                    onClick={() => decide("approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    disabled={!feedback.trim()}
                    onClick={() => decide("reject")}
                  >
                    Reject
                  </button>
                </div>
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
