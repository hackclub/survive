import { Head, useForm, usePage, router } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import type { Project, ProjectStatus, SharedProps } from "../../types"

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Approved",
  rejected: "Rejected",
}

export default function Show({
  project,
  can,
}: {
  project: Project
  can: { update: boolean; submitForReview: boolean }
}) {
  const { errors } = usePage<SharedProps>().props

  const form = useForm({
    name: project.name,
    description: project.description ?? "",
    repo_link: project.repoLink ?? "",
    demo_link: project.demoLink ?? "",
  })

  function save(e: React.FormEvent) {
    e.preventDefault()
    form.patch(`/projects/${project.id}`)
  }

  function submitForReview() {
    router.post(`/projects/${project.id}/submit_for_review`)
  }

  return (
    <>
      <Head title={`${project.name} - Survive`} />

      <Nav />

      <main id="main" className="project-form">
        <div className="project-form__shell">
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
                  messages.map((message) => <li key={`${field}-${message}`}>{message}</li>)
                )}
              </ul>
            </div>
          )}

          {can.update ? (
            <form onSubmit={save} className="field-group">
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
          ) : (
            <div className="field-group">
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
