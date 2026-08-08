import { Head, Link } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import type { Project, ProjectStatus } from "../../types"

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Approved",
  rejected: "Rejected",
}

export default function Index({ projects }: { projects: Project[] }) {
  return (
    <>
      <Head title="Dashboard - Survive" />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <div className="dashboard__header">
            <h1 className="dashboard__title">Your projects</h1>
            <Link className="btn btn--primary btn--sm" href="/projects/new">
              New project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="dashboard__empty">
              <p className="u-lead">You haven't started a project yet.</p>
              <Link className="btn btn--primary btn--sm" href="/projects/new">
                Start your first project
              </Link>
            </div>
          ) : (
            <ul className="dashboard__list">
              {projects.map((project) => (
                <li key={project.id} className="dashboard__row">
                  <span className="dashboard__name">{project.name}</span>
                  <span className={`dashboard__status dashboard__status--${project.status}`}>
                    {STATUS_LABEL[project.status]}
                  </span>
                  <span className="dashboard__updated u-sm u-faint">
                    Updated {project.updatedAt}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  )
}
