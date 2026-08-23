import { Head, Link, useForm, usePage, router } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Trail } from "../../components/Trail"
import { BannerUpload } from "../../components/BannerUpload"
import { HackatimeProjectPicker } from "../../components/HackatimeProjectPicker"
import { Checklist } from "../../components/Checklist"
import { formatHours, formatMinutes, humanizeField } from "../../lib/format"
import type { ChecksResult, HackatimeProject, Project, SharedProps } from "../../types"

const BAND: Record<string, string | undefined> = {
  changes: "returned",
  rejected: "returned",
  approved: "paid",
}

const EYEBROW: Record<string, string> = {
  draft: "Draft",
  sent: "In review",
  approved: "Settled",
  changes: "Changes requested",
  rejected: "Rejected",
}

function coinsFrom(minutes: number | null) {
  if (minutes === null) return null
  return Math.floor((minutes / 60) * 5)
}

export default function Show({
  project,
  can,
  checks,
  hackatimeProjects,
}: {
  project: Project
  can: { update: boolean; submitForReview: boolean }
  checks: ChecksResult | null
  hackatimeProjects: HackatimeProject[]
}) {
  const { auth, errors } = usePage<SharedProps>().props
  const stage = project.trailStage
  const linked = hackatimeProjects.filter((option) => option.linked)

  const form = useForm({
    name: project.name,
    description: project.description ?? "",
    repo_link: project.repoLink ?? "",
    demo_link: project.demoLink ?? "",
    banner: null as File | null,
  })

  function save(event: React.FormEvent) {
    event.preventDefault()
    form.patch(`/projects/${project.id}`)
  }

  function submitForReview() {
    form.transform((data) => ({ ...data, submit_for_review: true }))
    form.patch(`/projects/${project.id}`, {
      onFinish: () => form.transform((data) => data),
    })
  }

  const eyebrow = project.round
    ? `Round ${project.round} · ${EYEBROW[stage]}`
    : EYEBROW[stage]

  return (
    <>
      <Head title={`${project.name} - Survive`} />

      <AppShell
        eyebrow={eyebrow}
        title={project.name}
        narrow
        tone={BAND[stage] as "returned" | "paid" | undefined}
        actions={
          stage === "changes" || stage === "rejected" ? (
            <span className="band__status" style={{ color: "var(--rust-200)" }}>
              <i style={{ background: "var(--rust-400)" }} />
              {stage === "rejected" ? "Rejected" : "Changes needed"}
            </span>
          ) : stage === "approved" ? (
            <span className="band__status" style={{ color: "var(--lime-300)" }}>
              <i style={{ background: "var(--lime-400)" }} />
              Approved
            </span>
          ) : undefined
        }
      >
        <Trail stage={stage} note={project.trailNote ?? undefined} />

        {Object.keys(errors).length > 0 && (
          <div className="project-form__errors">
            <ul>
              {Object.entries(errors).map(([field, messages]) =>
                messages.map((message) => (
                  <li key={`${field}-${message}`}>
                    {humanizeField(field)} {message}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {(stage === "changes" || stage === "rejected") && project.reviewFeedback && (
          <div className="panel panel--bad" style={{ marginBottom: "var(--sp-4)" }}>
            <div className="panel__head">
              <h2 className="panel__title">What to fix</h2>
            </div>
            <p className="u-sm u-soft">{project.reviewFeedback}</p>
          </div>
        )}

        {stage === "approved" && (
          <div className="panel panel--go panel--payout" style={{ marginBottom: "var(--sp-5)" }}>
            <div className="payout">
              <span className="coin coin--xl" aria-hidden="true" />
              <b className="payout__amount">{project.paidCoins}</b>
            </div>
            <p className="u-sm u-soft">
              coins landed, from <b>{formatMinutes(project.approvedMinutes ?? 0)}</b> approved
            </p>
            <Link className="btn btn--go btn--sm" href="/shop" style={{ marginTop: "var(--sp-3)" }}>
              Spend them
            </Link>
          </div>
        )}

        {stage === "sent" && (
          <div className="camp__pair" style={{ marginBottom: "var(--sp-5)" }}>
            <div className="panel">
              <div className="panel__head">
                <h2 className="panel__title">What you sent</h2>
              </div>
              <dl>
                {project.repoLink && (
                  <div className="factline">
                    <dt>Repo</dt>
                    <dd>
                      <a className="u-accent u-mono u-sm" href={project.repoLink}>
                        {project.repoLink}
                      </a>
                    </dd>
                  </div>
                )}
                {project.demoLink && (
                  <div className="factline">
                    <dt>Demo</dt>
                    <dd>
                      <a className="u-accent u-mono u-sm" href={project.demoLink}>
                        {project.demoLink}
                      </a>
                    </dd>
                  </div>
                )}
                {linked.length > 0 && (
                  <div className="factline">
                    <dt>Hackatime</dt>
                    <dd className="u-sm">{linked.map((option) => option.name).join(", ")}</dd>
                  </div>
                )}
                <div className="factline">
                  <dt>Claimed</dt>
                  <dd className="u-mono u-sm">
                    {formatHours(linked.reduce((total, option) => total + option.seconds, 0))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="panel panel--warn">
              <div className="panel__head">
                <h2 className="panel__title">
                  If it is approved
                </h2>
              </div>
              <div className="payout payout--sm">
                <span className="coin coin--lg" aria-hidden="true" />
                <b className="payout__amount">
                  {coinsFrom(project.approvedMinutes) ??
                    Math.floor(
                      (linked.reduce((total, option) => total + option.seconds, 0) / 3600) * 5
                    )}
                </b>
                <span className="u-xs u-faint">coins</span>
              </div>
              <p className="u-xs u-soft" style={{ marginTop: "var(--sp-2)" }}>
                Approved hours can be adjusted before anything is paid.
              </p>
            </div>
          </div>
        )}

        {can.update && (
          <form onSubmit={save} className="field-group">
            <div className="field">
              <label className="field__label">
                Banner <span className="u-faint">(required to submit for review)</span>
              </label>
              <BannerUpload
                file={form.data.banner}
                currentUrl={project.bannerUrl}
                onChange={(file) => form.setData("banner", file)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="name">
                Project name
              </label>
              <input
                id="name"
                className="field__input"
                type="text"
                value={form.data.name}
                onChange={(event) => form.setData("name", event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="field__input field__input--textarea"
                rows={4}
                value={form.data.description}
                onChange={(event) => form.setData("description", event.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="repo_link">
                Repo link <span className="u-faint">(required to submit for review)</span>
              </label>
              <input
                id="repo_link"
                className="field__input"
                type="url"
                value={form.data.repo_link}
                onChange={(event) => form.setData("repo_link", event.target.value)}
                placeholder="https://github.com/you/project"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="demo_link">
                Demo link <span className="u-faint">(required to submit for review)</span>
              </label>
              <input
                id="demo_link"
                className="field__input"
                type="url"
                value={form.data.demo_link}
                onChange={(event) => form.setData("demo_link", event.target.value)}
                placeholder="https://your-demo.example.com"
              />
            </div>

            <div className="field">
              <label className="field__label">
                Hackatime project <span className="u-faint">(required to submit for review)</span>
              </label>

              {!auth.user?.hackatimeConnected ? (
                <p className="u-sm u-soft">
                  Connect Hackatime from{" "}
                  <Link className="u-accent" href="/account">
                    your account
                  </Link>{" "}
                  to track coding hours on this project.
                </p>
              ) : (
                <>
                  {linked.length > 0 && (
                    <ul className="hackatime-link__list">
                      {linked.map((option) => (
                        <li key={option.id} className="hackatime-link__row">
                          <span className="u-mono u-sm">{option.name}</span>
                          <span className="u-sm u-faint">{formatHours(option.seconds)}</span>
                          <button
                            className="btn btn--ghost btn--sm"
                            type="button"
                            onClick={() =>
                              router.post(
                                `/projects/${project.id}/hackatime_projects/${option.id}/unlink`
                              )
                            }
                          >
                            Unlink
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <HackatimeProjectPicker
                    options={hackatimeProjects.filter((option) => !option.linked)}
                    onSelect={(option) =>
                      router.post(
                        `/projects/${project.id}/hackatime_projects/${option.id}/link`
                      )
                    }
                  />
                </>
              )}
            </div>

            <div className="project-form__actions">
              <button className="btn btn--ghost" type="submit" disabled={form.processing}>
                {form.processing ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}

        {can.submitForReview && checks && (
          <div className="field-group">
            <Checklist checks={checks} />
            <div className="checklist__gate">
              <p className="u-sm u-soft">
                {checks.blocking.length === 0
                  ? "Submitting locks the project until a reviewer decides."
                  : "Fix everything above, then submit."}
              </p>
              <button
                className="btn btn--primary"
                type="button"
                disabled={checks.blocking.length > 0}
                onClick={submitForReview}
              >
                Submit for review
              </button>
            </div>
          </div>
        )}
      </AppShell>
    </>
  )
}
