import { Head, Link } from "@inertiajs/react"
import { Nav } from "../../../components/Nav"
import { Flash } from "../../../components/Flash"
import type { ReviewQueueEntry } from "../../../types"

export default function Index({ projects }: { projects: ReviewQueueEntry[] }) {
  return (
    <>
      <Head title="Review - Survive" />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <Flash />

          <div className="dashboard__header">
            <h1 className="dashboard__title">Review queue</h1>
          </div>

          {projects.length === 0 ? (
            <div className="dashboard__empty">
              <p className="u-lead">Nothing waiting on review right now.</p>
            </div>
          ) : (
            <ul className="dashboard__list">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link className="dashboard__row" href={`/admin/review/${project.id}`}>
                    <div className="dashboard__row-top">
                      <span className="dashboard__name">{project.name}</span>
                      <span className="u-sm u-faint">by {project.ownerName}</span>
                      {project.claimedByYou && (
                        <span className="dashboard__status dashboard__status--pending">
                          Claimed by you
                        </span>
                      )}
                    </div>

                    <div className="dashboard__row-meta u-sm u-faint">
                      <span>{project.repoLink ? "Repo linked" : "No repo link yet"}</span>
                      <span>{project.demoLink ? "Demo linked" : "No demo link yet"}</span>
                      <span>Submitted {project.submittedAt}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  )
}
