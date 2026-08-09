import { Head } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import type { ReviewHistoryEntry } from "../../../types"

const ACTION_LABEL: Record<ReviewHistoryEntry["action"], string> = {
  approved: "Approved",
  rejected: "Rejected",
}

export default function MyStats({
  totalReviews,
  approvedCount,
  rejectedCount,
  todayCount,
  weekCount,
  recent,
}: {
  totalReviews: number
  approvedCount: number
  rejectedCount: number
  todayCount: number
  weekCount: number
  recent: ReviewHistoryEntry[]
}) {
  return (
    <>
      <Head title="My review stats - Survive" />

      <AdminSidebarLayout>
        <div className="dashboard__header">
          <h1 className="dashboard__title">Your review stats</h1>
        </div>

        <div className="mystats__grid">
          <div className="mystats__tile">
            <span className="mystats__number">{totalReviews}</span>
            <span className="u-sm u-faint">Total reviews</span>
          </div>
          <div className="mystats__tile">
            <span className="mystats__number">{approvedCount}</span>
            <span className="u-sm u-faint">Approved</span>
          </div>
          <div className="mystats__tile">
            <span className="mystats__number">{rejectedCount}</span>
            <span className="u-sm u-faint">Rejected</span>
          </div>
          <div className="mystats__tile">
            <span className="mystats__number">{todayCount}</span>
            <span className="u-sm u-faint">Today</span>
          </div>
          <div className="mystats__tile">
            <span className="mystats__number">{weekCount}</span>
            <span className="u-sm u-faint">Last 7 days</span>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="dashboard__empty">
            <p className="u-lead">You haven't reviewed anything yet.</p>
          </div>
        ) : (
          <ul className="hackatime-link__list">
            {recent.map((event) => (
              <li key={event.id} className="hackatime-link__row">
                <span className="u-sm">
                  {ACTION_LABEL[event.action]} {event.projectName}
                </span>
                <span className="u-sm u-faint">{event.createdAt}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminSidebarLayout>
    </>
  )
}
