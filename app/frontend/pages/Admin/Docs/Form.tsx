import { Head, Link, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { useState } from "react"

type Doc = { id: number; title: string; slug: string; body: string; position: number; published: boolean }

export default function Form({ doc }: { doc: Doc | null }) {
  const [title, setTitle] = useState(doc?.title ?? "")
  const [slug, setSlug] = useState(doc?.slug ?? "")
  const [body, setBody] = useState(doc?.body ?? "")
  const [position, setPosition] = useState(doc?.position ?? 0)
  const [published, setPublished] = useState(doc?.published ?? true)

  function save() {
    const payload = { title, slug, body, position, published }
    if (doc) router.patch(`/admin/docs/${doc.id}`, payload)
    else router.post("/admin/docs", payload)
  }

  return <>
    <Head title={`${doc ? "Edit" : "New"} documentation - Survive`} />
    <AdminSidebarLayout eyebrow="Documentation" title={doc ? "Edit page" : "New page"} actions={<Link className="nav__ghost" href="/admin/docs">Back</Link>}>
      <section className="review__card">
        <div className="field-group">
          <div className="field"><label className="field__label" htmlFor="title">Title</label><input id="title" className="field__input" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="field"><label className="field__label" htmlFor="slug">Slug</label><input id="slug" className="field__input" value={slug} placeholder="getting-started" onChange={e => setSlug(e.target.value)} /></div>
          <div className="form-row">
            <div className="field"><label className="field__label" htmlFor="position">Position</label><input id="position" className="field__input" type="number" value={position} onChange={e => setPosition(Number(e.target.value))} /></div>
            <label className="checkbox"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Published</label>
          </div>
          <div className="field"><label className="field__label" htmlFor="body">Content</label><textarea id="body" className="field__input field__input--textarea" rows={18} value={body} onChange={e => setBody(e.target.value)} /></div>
          <div className="project-form__actions"><button className="btn btn--primary" type="button" onClick={save}>{doc ? "Save changes" : "Create page"}</button>{doc && <button className="btn btn--ghost" type="button" onClick={() => { if (confirm("Delete this documentation page?")) router.delete(`/admin/docs/${doc.id}`) }}>Delete</button>}</div>
        </div>
      </section>
    </AdminSidebarLayout>
  </>
}
