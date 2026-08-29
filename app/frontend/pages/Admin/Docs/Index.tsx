import { Head, Link } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"

type Doc = { id: number; title: string; slug: string; body: string; position: number; published: boolean; updatedAt: string | null }

export default function Index({ docs }: { docs: Doc[] }) {
  return <>
    <Head title="Docs - Admin - Survive" />
    <AdminSidebarLayout eyebrow="Documentation" title="Docs" actions={<Link className="btn btn--primary btn--sm" href="/admin/docs/new">New page</Link>}>
      <div className="camp__grid">
        {docs.map((doc) => <div className="panel" key={doc.id}>
          <div className="panel__head"><h2 className="panel__title">{doc.title}</h2><span className="u-xs u-faint">{doc.published ? "Published" : "Draft"}</span></div>
          <p className="u-xs u-faint">/{doc.slug} · position {doc.position}</p>
          <p className="u-sm u-soft" style={{ marginTop: "var(--sp-3)" }}>{doc.body.slice(0, 180)}{doc.body.length > 180 ? "…" : ""}</p>
          <Link className="btn btn--ghost btn--sm" style={{ marginTop: "var(--sp-4)" }} href={`/admin/docs/${doc.id}/edit`}>Edit</Link>
        </div>)}
      </div>
    </AdminSidebarLayout>
  </>
}
