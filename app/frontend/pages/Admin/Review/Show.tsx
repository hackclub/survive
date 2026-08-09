import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { Nav } from "../../../components/Nav"
import { Flash } from "../../../components/Flash"
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
}: {
  project: Project
  hackatimeProjects: HackatimeProject[]
  history: ProjectEvent[]
  submitterHistory: SubmitterHistory
}) {
  const [feedback, setFeedback] = useState("")

  function approve() {
    router.post(`/admin/review/${project.id}/approve`)
  }

  function unclaim() {
    router.delete(`/admin/review/${project.id}/claim`)
  }

  function reject(e: React.FormEvent) {
    e.preventDefault()
    router.post(`/admin/review/${project.id}/reject`, { feedback })
  }

  return (
    <>
      <Head title={`Review: ${project.name} - Survive`} />

      <Nav />

      <main id="main" className="project-form">
        <div className="project-form__shell">
          <Flash />

          <div className="dashboard__header">
            <h1 className="project-form__title">{project.name}</h1>
            <span className={`dashboard__status dashboard__status--${project.status}`}>
              {STATUS_LABEL[project.status]}
            </span>
            <button className="btn btn--ghost btn--sm" type="button" onClick={unclaim}>
              Unclaim
            </button>
          </div>

          <div className="field-group">
            {project.description && <p className="u-lead u-soft">{project.description}</p>}
            {project.repoLink && (
              <p>
                <a className="u-accent" href={project.repoLink}>
                  {project.repoLink}
                </a>
              </p>
            )}
            {project.demoLink && (
              <p>
                <a className="u-accent" href={project.demoLink}>
                  {project.demoLink}
                </a>
              </p>
            )}

            {hackatimeProjects.length > 0 && (
              <ul className="hackatime-link__list">
                {hackatimeProjects.map((hackatimeProject) => (
                  <li key={hackatimeProject.id} className="hackatime-link__row">
                    <span className="u-mono u-sm">{hackatimeProject.name}</span>
                    <span className="u-sm u-faint">{formatHours(hackatimeProject.seconds)}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="u-sm u-faint">
              This submitter has {submitterHistory.approvedCount} approved and{" "}
              {submitterHistory.rejectedCount} rejected project
              {submitterHistory.rejectedCount === 1 ? "" : "s"} on record.
            </p>

            {history.length > 0 && (
              <ul className="hackatime-link__list">
                {history.map((event) => (
                  <li key={event.id} className="hackatime-link__row">
                    <span className="u-sm">
                      {EVENT_LABEL[event.action]} by {event.actorName}
                      {event.feedback ? `, "${event.feedback}"` : ""}
                    </span>
                    <span className="u-sm u-faint">{event.createdAt}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="project-form__actions">
              <button className="btn btn--primary" type="button" onClick={approve}>
                Approve
              </button>
            </div>

            <form onSubmit={reject} className="field-group">
              <div className="field">
                <label className="field__label" htmlFor="feedback">
                  Reject with feedback
                </label>
                <textarea
                  id="feedback"
                  className="field__input field__input--textarea"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn--ghost" type="submit">
                Reject
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
