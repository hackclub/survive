import { Head, useForm, usePage } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import type { SharedProps } from "../../types"

export default function New() {
  const { errors } = usePage<SharedProps>().props

  const form = useForm({
    name: "",
    description: "",
    repo_link: "",
    demo_link: "",
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.post("/projects")
  }

  return (
    <>
      <Head title="New project - Survive" />

      <Nav />

      <main id="main" className="project-form">
        <div className="project-form__shell">
          <h1 className="project-form__title">Start a project</h1>
          <p className="u-lead u-soft project-form__note">
            Save it as a draft now, add your repo and demo links once you're ready to submit for
            review.
          </p>

          {Object.keys(errors).length > 0 && (
            <div className="project-form__errors">
              <ul>
                {Object.entries(errors).map(([field, messages]) =>
                  messages.map((message) => <li key={`${field}-${message}`}>{message}</li>)
                )}
              </ul>
            </div>
          )}

          <form onSubmit={submit} className="field-group">
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

            <button className="btn btn--primary" type="submit" disabled={form.processing}>
              {form.processing ? "Saving..." : "Save draft"}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
