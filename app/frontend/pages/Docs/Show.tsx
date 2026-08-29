import { Head, Link } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"

type Doc = { id: number; title: string; slug: string; body: string; position: number; published: boolean }

export default function Show({ docs }: { docs: Doc[] }) {
  return <>
    <Head title="Docs - Survive" />
    <AppShell eyebrow="Docs" title="How Survive works" narrow lede="Everything you need to know about Survive.">
      <div className="docs">
        <aside className="docs__toc panel">
          <div className="panel__head"><h2 className="panel__title">On this page</h2></div>
          <nav aria-label="Documentation sections">
            {docs.map(doc => <a key={doc.id} className="docs__toc-link" href={`#${doc.slug}`}>{doc.title}</a>)}
          </nav>
          <Link className="btn btn--ghost btn--sm" style={{ marginTop: "var(--sp-4)" }} href="/admin/docs">Manage docs</Link>
        </aside>
        <article className="docs__content">
          {docs.length === 0 ? <section className="panel docs__section"><h2 className="docs__title">Documentation is coming soon</h2></section> : docs.map(doc =>
            <section key={doc.id} id={doc.slug} className="panel docs__section">
              <p className="band__eyebrow">{doc.title}</p>
              <h2 className="docs__title">{doc.title}</h2>
              <div className="docs__body" style={{ whiteSpace: "pre-wrap" }}>{doc.body}</div>
            </section>
          )}
        </article>
      </div>
    </AppShell>
  </>
}
