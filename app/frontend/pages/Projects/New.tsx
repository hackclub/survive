import { Head, useForm, usePage } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { BannerUpload } from "../../components/BannerUpload"
import { HackatimeProjectPicker } from "../../components/HackatimeProjectPicker"
import { humanizeField } from "../../lib/format"
import type { HackatimeProject, SharedProps } from "../../types"

export default function New({ hackatimeProjects }: { hackatimeProjects: HackatimeProject[] }) {
  const { auth, errors } = usePage<SharedProps>().props

  const form = useForm({
    name: "",
    description: "",
    repo_link: "",
    demo_link: "",
    hackatime_project_name: "",
    banner: null as File | null,
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    form.post("/projects")
  }

  return (
    <>
      <Head title="New project - Survive" />

      <AppShell
        eyebrow="Camp · new"
        title="Start a project"
        narrow
        lede="Save it as a draft now, add your repo and demo links once you are ready to submit for review."
      >

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

          <form onSubmit={submit} className="field-group">
            <div className="field">
              <label className="field__label">
                Banner <span className="u-faint">(required to submit for review)</span>
              </label>
              <BannerUpload
                file={form.data.banner}
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
                Hackatime project <span className="u-faint">(optional, required to submit for review)</span>
              </label>

              {!auth.user?.hackatimeConnected ? (
                <p className="u-sm u-soft">
                  Connect Hackatime from your{" "}
                  <a className="u-accent" href="/dashboard">
                    dashboard
                  </a>{" "}
                  to link one now, or do it later from the project page.
                </p>
              ) : form.data.hackatime_project_name ? (
                <div className="hackatime-link__row">
                  <span className="u-mono u-sm">{form.data.hackatime_project_name}</span>
                  <button
                    className="btn btn--ghost btn--sm"
                    type="button"
                    onClick={() => form.setData("hackatime_project_name", "")}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <HackatimeProjectPicker
                  options={hackatimeProjects}
                  onSelect={(option) => form.setData("hackatime_project_name", option.name)}
                />
              )}
            </div>

            <button className="btn btn--primary" type="submit" disabled={form.processing}>
              {form.processing ? "Saving..." : "Save draft"}
            </button>
          </form>
      </AppShell>
    </>
  )
}
