import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"

type GalleryImage = { id: number; caption: string | null; placement: string; imageUrl: string }

export default function Index({ images }: { images: GalleryImage[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [placement, setPlacement] = useState("both")

  function upload() {
    if (!file) return
    router.post("/admin/gallery_images", { image: file, caption, placement }, {
      forceFormData: true,
      onSuccess: () => { setFile(null); setCaption("") },
    })
  }

  return <>
    <Head title="Gallery images - Admin - Survive" />
    <AdminSidebarLayout eyebrow="Admin · Content" title="Gallery images" actions={<Link className="nav__ghost" href="/admin/hike_grants">Hike grants</Link>}>
      <div style={{ maxWidth: 1000, display: "grid", gap: "var(--sp-4)" }}>
        <section className="card" style={{ padding: "var(--sp-4)", display: "grid", gap: "var(--sp-3)" }}>
          <h2 className="u-h3">Upload an image</h2>
          <label className="field"><span className="field__label">Image</span><input className="field__input" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>
          <label className="field"><span className="field__label">Caption (optional)</span><input className="field__input" value={caption} onChange={e => setCaption(e.target.value)} placeholder="A weekend out on the trail" /></label>
          <label className="field"><span className="field__label">Show in</span><select className="field__input" value={placement} onChange={e => setPlacement(e.target.value)}><option value="both">Main site and Hikes</option><option value="landing">Main site only</option><option value="hikes">Hikes only</option></select></label>
          <div><button className="btn btn--primary" type="button" disabled={!file} onClick={upload}>Upload image</button></div>
        </section>
        <section>
          <h2 className="u-h2">Uploaded images</h2>
          {images.length === 0 ? <p className="u-sm u-faint">No gallery images yet.</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
            {images.map(image => <article className="card" key={image.id} style={{ padding: "var(--sp-2)" }}>
              <img src={image.imageUrl} alt={image.caption || ""} style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: 8 }} />
              <div style={{ padding: "var(--sp-2)", display: "grid", gap: "var(--sp-2)" }}>
                <strong className="u-sm">{image.caption || "Untitled image"}</strong>
                <span className="u-xs u-faint">{image.placement === "both" ? "Main site + Hikes" : image.placement}</span>
                <button className="btn btn--quiet btn--sm" type="button" onClick={() => { if (confirm("Delete this gallery image?")) router.delete(`/admin/gallery_images/${image.id}`) }}>Delete</button>
              </div>
            </article>)}
          </div>}
        </section>
      </div>
    </AdminSidebarLayout>
  </>
}
