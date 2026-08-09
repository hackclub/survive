import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { Nav } from "../../../components/Nav"
import { Flash } from "../../../components/Flash"
import { formatHours } from "../../../lib/format"
import type { Pagination, ReviewQueueEntry } from "../../../types"

export default function Index({
  projects,
  pagination,
  query,
}: {
  projects: ReviewQueueEntry[]
  pagination: Pagination
  query: string
}) {
  const [search, setSearch] = useState(query)

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    router.get("/admin/review", { q: search }, { preserveState: true })
  }

  function goToPage(page: number) {
    router.get("/admin/review", { q: query, page }, { preserveState: true })
  }

  return (
    <>
      <Head title="Review - Survive" />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <Flash />

          <div className="dashboard__header">
            <h1 className="dashboard__title">Review queue</h1>
            <span className="u-sm u-faint">{pagination.count} waiting</span>
            <Link className="btn btn--primary btn--sm" href="/admin/review/next">
              Review next
            </Link>
          </div>

          <form onSubmit={submitSearch} className="dashboard__search">
            <input
              className="field__input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project or submitter name"
            />
            <button className="btn btn--ghost btn--sm" type="submit">
              Search
            </button>
          </form>

          {projects.length === 0 ? (
            <div className="dashboard__empty">
              <p className="u-lead">Nothing waiting on review right now.</p>
            </div>
          ) : (
            <>
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
                        <span>{formatHours(project.hackatimeSeconds)}</span>
                        <span>Submitted {project.submittedAt}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {pagination.pages > 1 && (
                <div className="dashboard__pagination">
                  <button
                    className="btn btn--ghost btn--sm"
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => goToPage(pagination.page - 1)}
                  >
                    Previous
                  </button>
                  <span className="u-sm u-faint">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="btn btn--ghost btn--sm"
                    type="button"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => goToPage(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
