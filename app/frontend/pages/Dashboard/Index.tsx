import { Head, Link, usePage } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Empty } from "../../components/Empty"
import { SkeletonCards } from "../../components/Skeleton"
import { useVisiting } from "../../lib/useVisiting"
import { formatMinutes } from "../../lib/format"
import type { Project, SharedProps } from "../../types"

type Stats = { earned: number; approvedMinutes: number; inReview: number; held: number }

const TONE: Record<string, string> = {
  draft: "var(--stone-400)",
  sent: "var(--ember)",
  approved: "var(--lime-400)",
  changes: "var(--rust-400)",
  rejected: "var(--rust-400)",
}

const LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "In review",
  approved: "Approved",
  changes: "Changes requested",
  rejected: "Rejected",
}

const FILL: Record<string, string> = {
  draft: "17%",
  sent: "50%",
  approved: "100%",
  changes: "83%",
  rejected: "83%",
}

function hours(minutes: number) {
  return `${Math.floor(minutes / 60)}h`
}

function Card({ project, tall }: { project: Project; tall?: boolean }) {
  const stage = project.trailStage

  return (
    <Link className={`gcard${tall ? " gcard--tall" : ""}`} href={`/projects/${project.id}`}>
      {project.bannerUrl ? (
        <img className="gcard__image" src={project.bannerUrl} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="gcard__placeholder" />
      )}
      <span className="gcard__veil" />

      <div className="gcard__top">
        <span className="gcard__state">
          <i style={{ background: TONE[stage] }} />
          {stage === "approved" && project.paidCoins
            ? `Paid, ${project.paidCoins} wood`
            : LABEL[stage]}
        </span>
        {project.round && <span className="gcard__tag">Round {project.round}</span>}
      </div>

      <div className="gcard__body">
        <h2 className="gcard__name">{project.name}</h2>
        {project.description && <p className="gcard__desc">{project.description}</p>}
        <div className="gcard__meta">
          {project.approvedMinutes !== null && (
            <span>{formatMinutes(project.approvedMinutes)} approved</span>
          )}
          <span>updated {project.updatedAt}</span>
        </div>
      </div>

      <span className="gcard__rail">
        <b style={{ width: FILL[stage] }} />
      </span>
    </Link>
  )
}

export default function Index({ projects, stats }: { projects: Project[]; stats: Stats }) {
  const { auth } = usePage<SharedProps>().props
  const visiting = useVisiting()
  const [live, ...rest] = projects
  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

  return (
    <>
      <Head title="Camp - Survive" />

      <AppShell
        eyebrow="Camp"
        title="Your projects"
        narrow
        actions={
          <Link className="btn btn--primary btn--sm" href="/projects/new">
            Start a project
          </Link>
        }
        stats={
          projects.length > 0
            ? [
              { label: "Wood earned", value: stats.earned, tone: "go" },
              { label: "Approved", value: hours(stats.approvedMinutes) },
              { label: "In review", value: stats.inReview, tone: "live" },
              { label: "Held by orders", value: stats.held },
            ]
            : undefined
        }
      >
        {visiting ? (
          <SkeletonCards />
        ) : projects.length === 0 ? (
          <Empty
            action={
              <Link className="btn btn--primary btn--sm" href="/projects/new">
                Start a project
              </Link>
            }
          />
        ) : (
          <div className="camp__grid">
            <Card project={live} tall />
            {rest.length > 0 && (
              <div className="camp__pair">
                {rest.map((project) => (
                  <Card key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}

        {auth.user && !auth.user.hackatimeConnected && (
          <form
            action="/auth/hackatime"
            method="post"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-3)",
              marginTop: "var(--sp-5)",
              flexWrap: "wrap",
            }}
          >
            <input type="hidden" name="authenticity_token" value={csrfToken} />
            <button className="btn btn--ghost btn--sm" type="submit">
              Connect Hackatime
            </button>
          </form>
        )}
      </AppShell>
    </>
  )
}
