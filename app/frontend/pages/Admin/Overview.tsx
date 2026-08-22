import { Head, Link } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../components/AdminSidebarLayout"
import { Status, Tag } from "../../components/Status"

type Counts = {
  total: number
  awaitingIngest: number
  ingestFailed: number
  stuck: number
  inAri: number
}

type FinalReviews = {
  pending: number
  passed: number
  deducted: number
  banned: number
  oldestWaiting: string | null
  oldestWaitingDays: number | null
}

type Ari = {
  configured: boolean
  webhookConfigured: boolean
  lastDeliveryAt: string | null
  lastDeliveryEvent: string | null
  unprocessedDeliveries: number
  lastStatusRefreshAt: string | null
}

type Activity = { id: number; action: string; actor: string | null; target: string; at: string }

function Tile({
  label,
  value,
  href,
  alarming,
}: {
  label: string
  value: number | string
  href?: string
  alarming?: boolean
}) {
  const body = (
    <div className={`mystats__tile${alarming ? " mystats__tile--alarming" : ""}`}>
      <span className="mystats__number">{value}</span>
      <span className="u-xs u-faint">{label}</span>
    </div>
  )

  return href ? <Link href={href}>{body}</Link> : body
}

export default function Overview({
  submissions,
  finalReviews,
  ari,
  recent,
}: {
  submissions: Counts
  finalReviews: FinalReviews
  ari: Ari
  recent: Activity[]
}) {
  return (
    <>
      <Head title="Admin - Survive" />

      <AdminSidebarLayout>
        <div className="dashboard__header">
          <h1 className="dashboard__title">Overview</h1>
        </div>

        <h2 className="u-h3" style={{ marginBottom: "var(--sp-3)" }}>
          Needs a person
        </h2>
        <div className="mystats__grid">
          <Tile
            label="Never sent to Ari"
            value={submissions.ingestFailed}
            href="/admin/reviews?filter=ingest_failed"
            alarming={submissions.ingestFailed > 0}
          />
          <Tile
            label="Stuck in Ari"
            value={submissions.stuck}
            href="/admin/reviews?filter=stuck"
            alarming={submissions.stuck > 0}
          />
          <Tile
            label="Awaiting final review"
            value={finalReviews.pending}
            href="/admin/final_reviews"
            alarming={finalReviews.pending > 0}
          />
          <Tile
            label="Deliveries unapplied"
            value={ari.unprocessedDeliveries}
            alarming={ari.unprocessedDeliveries > 0}
          />
        </div>

        {finalReviews.oldestWaitingDays !== null && finalReviews.oldestWaitingDays >= 1 && (
          <p className="u-sm u-soft" style={{ marginBottom: "var(--sp-5)" }}>
            The oldest final review has been waiting {finalReviews.oldestWaitingDays} day
            {finalReviews.oldestWaitingDays === 1 ? "" : "s"}, since {finalReviews.oldestWaiting}.
            Nothing is paid out until it is decided.
          </p>
        )}

        <h2 className="u-h3" style={{ margin: "var(--sp-6) 0 var(--sp-3)" }}>
          Where everything is
        </h2>
        <div className="mystats__grid">
          <Tile label="Submissions total" value={submissions.total} href="/admin/reviews" />
          <Tile label="Not sent yet" value={submissions.awaitingIngest} />
          <Tile label="Open in Ari" value={submissions.inAri} />
          <Tile label="Passed" value={finalReviews.passed} href="/admin/final_reviews?filter=passed" />
          <Tile label="Deducted" value={finalReviews.deducted} href="/admin/final_reviews?filter=deducted" />
          <Tile label="Banned" value={finalReviews.banned} href="/admin/final_reviews?filter=banned" />
        </div>

        <div className="admin-split">
          <section className="review__card">
            <h2 className="review__card-title u-h3">Ari</h2>
            <dl className="signal-list">
              <div>
                <dt className="u-label u-faint">Sending</dt>
                <dd>
                  {ari.configured ? (
                    <Status tone="ok">Configured</Status>
                  ) : (
                    <Status tone="bad">No program id or secret</Status>
                  )}
                </dd>
              </div>
              <div>
                <dt className="u-label u-faint">Receiving</dt>
                <dd>
                  {ari.webhookConfigured ? (
                    <Status tone="ok">Configured</Status>
                  ) : (
                    <Status tone="bad">No webhook secret</Status>
                  )}
                </dd>
              </div>
              <div>
                <dt className="u-label u-faint">Last delivery</dt>
                <dd className="u-sm">
                  {ari.lastDeliveryAt ? (
                    <>
                      {ari.lastDeliveryAt} <Tag>{ari.lastDeliveryEvent}</Tag>
                    </>
                  ) : (
                    <span className="u-faint">Nothing yet</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="u-label u-faint">Last status check</dt>
                <dd className="u-sm">
                  {ari.lastStatusRefreshAt ?? <span className="u-faint">Never run</span>}
                </dd>
              </div>
            </dl>
          </section>

          <section className="review__card">
            <h2 className="review__card-title u-h3">Recent</h2>
            {recent.length === 0 ? (
              <p className="u-sm u-faint">Nothing yet.</p>
            ) : (
              <ul className="activity">
                {recent.map((entry) => (
                  <li key={entry.id} className="activity__row">
                    <span className="u-sm">
                      <strong>{entry.actor ?? "system"}</strong> {entry.action}
                    </span>
                    <span className="u-xs u-faint u-mono">{entry.at}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link className="btn btn--quiet btn--sm" href="/admin/audit_logs" style={{ marginTop: "var(--sp-3)" }}>
              Full audit log
            </Link>
          </section>
        </div>
      </AdminSidebarLayout>
    </>
  )
}
