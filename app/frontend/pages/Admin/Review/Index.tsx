import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status } from "../../../components/Status"
import { formatHours } from "../../../lib/format"
import type { Pagination, ReviewQueueEntry } from "../../../types"

export default function Index({
  reviews,
  pagination,
  query,
}: {
  reviews: ReviewQueueEntry[]
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

      <AdminSidebarLayout>
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Review queue</h1>
            <p className="dashboard__subtitle u-sm u-faint">{pagination.count} waiting</p>
          </div>
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

        {reviews.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">Nothing waiting on review right now.</p>
          </div>
        ) : (
          <>
            <ul className="dashboard__list">
              {reviews.map((review) => (
                <li key={review.id}>
                  <Link className="dashboard__row dashboard__row--banner" href={`/admin/review/${review.id}`}>
                    {review.bannerUrl ? (
                      <img
                        className="dashboard__row-banner-image"
                        src={review.bannerUrl}
                        alt=""
                      />
                    ) : (
                      <div className="dashboard__row-banner-placeholder" />
                    )}

                    <div className="dashboard__row-glass">
                      <div className="dashboard__row-top">
                        <span className="dashboard__name">{review.name}</span>
                        <span className="u-sm u-faint">by {review.ownerName}</span>
                        {review.claimedByYou && (
                          <Status tone="warn" invert>
                            Claimed by you
                          </Status>
                        )}
                      </div>

                      <div className="dashboard__row-meta u-sm u-faint">
                        <span>{review.repoLink ? "Repo linked" : "No repo link yet"}</span>
                        <span>{review.demoLink ? "Demo linked" : "No demo link yet"}</span>
                        <span>{formatHours(review.hackatimeSeconds)}</span>
                        <span>Round {review.round}</span>
                        <span>Submitted {review.submittedAt}</span>
                      </div>
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
      </AdminSidebarLayout>
    </>
  )
}
