import { Head, useForm, usePage, router } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import { Flash } from "../../components/Flash"
import { BannerUpload } from "../../components/BannerUpload"
import { HackatimeProjectPicker } from "../../components/HackatimeProjectPicker"
import { formatHours, humanizeField } from "../../lib/format"
import type { HackatimeProject, Project, ProjectStatus, SharedProps } from "../../types"

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Approved",
  rejected: "Rejected",
}

export default function Show({
  project,
  can,
  hackatimeProjects,
}: {
  project: Project
  can: { update: boolean; submitForReview: boolean }
  hackatimeProjects: HackatimeProject[]
}) {
  const { auth, errors } = usePage<SharedProps>().props

  const form = useForm({
    name: project.name,
    description: project.description ?? "",
    repo_link: project.repoLink ?? "",
    demo_link: project.demoLink ?? "",
    banner: null as File | null,
  })

  function save(e: React.FormEvent) {
    e.preventDefault()
    form.patch(`/projects/${project.id}`)
  }

  function submitForReview() {
    form.transform((data) => ({ ...data, submit_for_review: true }))
    form.patch(`/projects/${project.id}`, {
      onFinish: () => form.transform((data) => data),
    })
  }

  function linkHackatimeProject(hackatimeProject: HackatimeProject) {
    router.post(`/projects/${project.id}/hackatime_projects/${hackatimeProject.id}/link`)
  }

  function unlinkHackatimeProject(hackatimeProjectId: number) {
    router.post(`/projects/${project.id}/hackatime_projects/${hackatimeProjectId}/unlink`)
  }

  return (
    <>
      <Head title={`${project.name} - Survive`} />

      <Nav />

      <main id="main" className="project-form">
        <div className="project-form__shell">
          <Flash />

          <div className="dashboard__header">
            <h1 className="project-form__title">{project.name}</h1>
            <span className={`dashboard__status dashboard__status--${project.status}`}>
              {STATUS_LABEL[project.status]}
            </span>
          </div>

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

          {project.reviewFeedback && (
            <div className="project-form__errors">
              <p className="u-sm">{project.reviewFeedback}</p>
            </div>
          )}

          {can.update ? (
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
                  onChange={(e) => form.setData("name", e.target.value)}
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
                  onChange={(e) => form.setData("description", e.target.value)}
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
                  onChange={(e) => form.setData("repo_link", e.target.value)}
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
                  onChange={(e) => form.setData("demo_link", e.target.value)}
                  placeholder="https://your-demo.example.com"
                />
              </div>

              <div className="field">
                <label className="field__label">
                  Hackatime project <span className="u-faint">(required to submit for review)</span>
                </label>

                {!auth.user?.hackatimeConnected ? (
                  <p className="u-sm u-soft">
                    Connect Hackatime from your{" "}
                    <a className="u-accent" href="/dashboard">
                      dashboard
                    </a>{" "}
                    to track coding hours on this project.
                  </p>
                ) : (
                  <>
                    {hackatimeProjects.filter((hp) => hp.linked).length > 0 && (
                      <ul className="hackatime-link__list">
                        {hackatimeProjects
                          .filter((hp) => hp.linked)
                          .map((hackatimeProject) => (
                            <li key={hackatimeProject.id} className="hackatime-link__row">
                              <span className="u-mono u-sm">{hackatimeProject.name}</span>
                              <span className="u-sm u-faint">
                                {formatHours(hackatimeProject.seconds)}
                              </span>
                              <button
                                className="btn btn--ghost btn--sm"
                                type="button"
                                onClick={() => unlinkHackatimeProject(hackatimeProject.id)}
                              >
                                Unlink
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}

                    <HackatimeProjectPicker
                      options={hackatimeProjects.filter((hp) => !hp.linked)}
                      onSelect={linkHackatimeProject}
                    />
                  </>
                )}
              </div>

              <div className="project-form__actions">
                <button className="btn btn--ghost" type="submit" disabled={form.processing}>
                  {form.processing ? "Saving..." : "Save"}
                </button>
                {can.submitForReview && (
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={submitForReview}
                  >
                    Submit for review
                  </button>
                )}
              </div>
            </form>
          ) : null}

          {!can.update && (
            <div className="field-group">
              {project.bannerUrl && (
                <div className="project-banner">
                  <img className="banner-upload__image" src={project.bannerUrl} alt="" />
                </div>
              )}
              {project.description && <p className="u-lead u-soft">{project.description}</p>}
              {project.repoLink && (
                <p>
                  <a className="u-accent" href={project.repoLink}>
                    {project.repoLink}
                  </a>
                </p>
              )}
              {project.demoLink && (
                <p>
                  <a className="u-accent" href={project.demoLink}>
                    {project.demoLink}
                  </a>
                </p>
              )}

              {hackatimeProjects.filter((hp) => hp.linked).length > 0 && (
                <ul className="hackatime-link__list">
                  {hackatimeProjects
                    .filter((hp) => hp.linked)
                    .map((hackatimeProject) => (
                      <li key={hackatimeProject.id} className="hackatime-link__row">
                        <span className="u-mono u-sm">{hackatimeProject.name}</span>
                        <span className="u-sm u-faint">{formatHours(hackatimeProject.seconds)}</span>
                      </li>
                    ))}
                </ul>
              )}

              <p className="u-sm u-faint">
                This project is locked from editing while {STATUS_LABEL[project.status].toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
