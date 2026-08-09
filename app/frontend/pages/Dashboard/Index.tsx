import { Head, Link, usePage } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import { Flash } from "../../components/Flash"
import type { Project, ProjectStatus, SharedProps } from "../../types"

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Approved",
  rejected: "Rejected",
}

export default function Index({ projects }: { projects: Project[] }) {
  const { auth } = usePage<SharedProps>().props
  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

  return (
    <>
      <Head title="Dashboard - Survive" />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <Flash />

          <div className="dashboard__header">
            <h1 className="dashboard__title">Your projects</h1>
            <Link className="btn btn--primary btn--sm" href="/projects/new">
              New project
            </Link>
          </div>

          {auth.user && !auth.user.hackatimeConnected && (
            <div className="dashboard__hackatime-banner">
              <p className="u-sm u-soft">
                Connect Hackatime to track coding hours on your projects.
              </p>
              <form action="/auth/hackatime" method="post">
                <input type="hidden" name="authenticity_token" value={csrfToken} />
                <button className="btn btn--ghost btn--sm" type="submit">
                  Connect Hackatime
                </button>
              </form>
            </div>
          )}

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
                <li key={project.id}>
                  <Link className="dashboard__row dashboard__row--banner" href={`/projects/${project.id}`}>
                    {project.bannerUrl ? (
                      <img
                        className="dashboard__row-banner-image"
                        src={project.bannerUrl}
                        alt=""
                      />
                    ) : (
                      <div className="dashboard__row-banner-placeholder" />
                    )}

                    <div className="dashboard__row-glass">
                      <div className="dashboard__row-top">
                        <span className="dashboard__name">{project.name}</span>
                        <span className={`dashboard__status dashboard__status--${project.status}`}>
                          {STATUS_LABEL[project.status]}
                        </span>
                      </div>

                      <p className="dashboard__description u-sm u-soft">
                        {project.description || "No description yet."}
                      </p>

                      <div className="dashboard__row-meta u-sm u-faint">
                        <span>{project.repoLink ? "Repo linked" : "No repo link yet"}</span>
                        <span>{project.demoLink ? "Demo linked" : "No demo link yet"}</span>
                        <span>Updated {project.updatedAt}</span>
                      </div>
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
