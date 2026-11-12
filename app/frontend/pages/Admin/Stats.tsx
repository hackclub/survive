import { useState } from "react"
import { Head, Link } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../components/AdminSidebarLayout"

type Day = { day: string; label: string; signups: number; active: number; coding: number; codingSurvive: number; hours: number }
type Props = {
  days: number
  ranges: number[]
  today: { signupsToday: number; signupsWeek: number; activeToday: number; activeWeek: number; codingToday: number; codingWeek: number }
  daily: Day[]
  funnel: { label: string; value: number }[]
  totals: { users: number; projects: number; shipped: number; approvedHours: number; woodEarned: number; woodSpent: number; orders: number; hikes: number }
  trackingSince: { visits: string | null; hackatime: string | null }
}

const num = (n: number) => n.toLocaleString("en-US")

function Tile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="mystats__tile">
      <span className="mystats__number">{typeof value === "number" ? num(value) : value}</span>
      <span className="u-xs u-faint">{label}</span>
      {sub && <span className="u-xs u-faint">{sub}</span>}
    </div>
  )
}

// One series per chart, so there's no legend to decode. Hover (or focus) a bar for the exact
// number; the table under each chart has every value.
function BarChart({ title, note, data, value, detail }: {
  title: string
  note?: string
  data: Day[]
  value: (d: Day) => number
  detail?: (d: Day) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const [table, setTable] = useState(false)
  const values = data.map(value)
  const max = Math.max(1, ...values)
  const total = values.reduce((a, b) => a + b, 0)
  const width = 640
  const height = 160
  const gap = 2
  const barW = Math.max(1, width / data.length - gap)
  const step = Math.max(1, Math.ceil(data.length / 6))
  const shown = hover !== null ? data[hover] : null

  return (
    <section className="card stats-chart" style={{ padding: "var(--sp-4)", display: "grid", gap: "var(--sp-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--sp-2)", flexWrap: "wrap" }}>
        <h3 className="u-h3">{title}</h3>
        <button className="btn btn--quiet btn--sm" type="button" onClick={() => setTable((t) => !t)}>{table ? "Show chart" : "Show table"}</button>
      </div>
      <p className="u-xs u-faint" style={{ minHeight: "1.2em" }}>
        {shown
          ? <><strong className="u-sm" style={{ color: "var(--ink)" }}>{num(value(shown))}</strong> on {shown.label}{detail ? ` · ${detail(shown)}` : ""}</>
          : <>Max {num(max === 1 && total === 0 ? 0 : max)} in a day{note ? ` · ${note}` : ""}</>}
      </p>

      {table ? (
        <div style={{ maxHeight: 240, overflow: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Day</th><th>{title}</th></tr></thead>
            <tbody>{[...data].reverse().map((d) => <tr key={d.day}><td>{d.label}</td><td className="u-mono">{num(value(d))}{detail ? <span className="u-xs u-faint"> · {detail(d)}</span> : null}</td></tr>)}</tbody>
          </table>
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height + 20}`} width="100%" role="img" aria-label={`${title}, last ${data.length} days`} onMouseLeave={() => setHover(null)}>
          <line x1={0} x2={width} y1={height} y2={height} stroke="var(--line)" strokeWidth={1} />
          {data.map((d, i) => {
            const v = values[i]
            const h = v === 0 ? 0 : Math.max(3, (v / max) * (height - 8))
            const x = i * (barW + gap)
            return (
              <g key={d.day} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.label}: ${v}`}>
                <rect x={x - gap / 2} y={0} width={barW + gap} height={height} fill="transparent" />
                {h > 0 && <rect x={x} y={height - h} width={barW} height={h} rx={Math.min(4, barW / 2)} fill="var(--ember)" opacity={hover === null || hover === i ? 1 : 0.45} />}
                {i % step === 0 && <text x={x + barW / 2} y={height + 15} textAnchor="middle" fontSize={11} fill="var(--ink-soft, currentColor)" opacity={0.7}>{d.label}</text>}
              </g>
            )
          })}
        </svg>
      )}
    </section>
  )
}

export default function Stats({ days, ranges, today, daily, funnel, totals, trackingSince }: Props) {
  const top = Math.max(1, funnel[0]?.value ?? 1)

  return (
    <>
      <Head title="Stats - Admin - Survive" />
      <AdminSidebarLayout
        eyebrow="Admin"
        title="Stats"
        actions={
          <div style={{ display: "flex", gap: "var(--sp-1)" }}>
            {ranges.map((r) => (
              <Link key={r} href={`/admin/stats?days=${r}`} className={r === days ? "btn btn--primary btn--sm" : "btn btn--quiet btn--sm"} preserveScroll>
                {r} days
              </Link>
            ))}
          </div>
        }
      >
        <h2 className="u-h3" style={{ marginBottom: "var(--sp-3)" }}>Right now</h2>
        <div className="mystats__grid">
          <Tile label="Active today" value={today.activeToday} sub={`${num(today.activeWeek)} this week`} />
          <Tile label="Coding today" value={today.codingToday} sub={`${num(today.codingWeek)} this week`} />
          <Tile label="Sign-ups today" value={today.signupsToday} sub={`${num(today.signupsWeek)} this week`} />
          <Tile label="Signed up" value={totals.users} />
        </div>

        <div className="stats-charts" style={{ display: "grid", gap: "var(--sp-3)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", marginBottom: "var(--sp-5)" }}>
          <BarChart title="Sign-ups" data={daily} value={(d) => d.signups} />
          <BarChart title="Active on the site" note={trackingSince.visits ? `counting since ${trackingSince.visits}` : "starts counting after this deploy"} data={daily} value={(d) => d.active} />
          <BarChart title="Coding on Hackatime" note={trackingSince.hackatime ? `counting since ${trackingSince.hackatime}` : "first numbers a day after deploy"} data={daily} value={(d) => d.coding} detail={(d) => `${num(d.codingSurvive)} on Survive projects`} />
          <BarChart title="Hours coded" note="all Hackatime projects" data={daily} value={(d) => d.hours} />
        </div>

        <h2 className="u-h3" style={{ marginBottom: "var(--sp-3)" }}>How far people get</h2>
        <div className="card" style={{ padding: "var(--sp-4)", display: "grid", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
          {funnel.map((step, i) => {
            const pct = Math.round((step.value / top) * 100)
            const prev = i > 0 ? funnel[i - 1].value : null
            return (
              <div key={step.label} style={{ display: "grid", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-2)" }} className="u-sm">
                  <span>{step.label}</span>
                  <span><strong>{num(step.value)}</strong> <span className="u-xs u-faint">{pct}%{prev ? ` · ${Math.round((step.value / Math.max(1, prev)) * 100)}% of the step before` : ""}</span></span>
                </div>
                <div style={{ height: 10, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: "var(--ember)" }} />
                </div>
              </div>
            )
          })}
        </div>

        <h2 className="u-h3" style={{ marginBottom: "var(--sp-3)" }}>All time</h2>
        <div className="mystats__grid">
          <Tile label="Projects" value={totals.projects} />
          <Tile label="Shipped" value={totals.shipped} />
          <Tile label="Hours approved" value={totals.approvedHours} />
          <Tile label="Wood earned" value={totals.woodEarned} />
          <Tile label="Wood spent" value={totals.woodSpent} />
          <Tile label="Orders" value={totals.orders} />
          <Tile label="Hikes" value={totals.hikes} />
        </div>

        <p className="u-xs u-faint">
          Active means someone opened the site while signed in that day. Coding means their Hackatime total went up that day; we check
          every 2 hours. Test submissions aren't counted.
        </p>
      </AdminSidebarLayout>
    </>
  )
}
