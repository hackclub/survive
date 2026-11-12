import { useState } from "react"

type Slide = { id: number; imageUrl: string; caption: string | null }

export function ImageCarousel({ images, label = "Gallery" }: { images: Slide[]; label?: string }) {
  const [active, setActive] = useState(0)
  if (!images.length) return null
  const current = images[active]
  const move = (direction: number) => setActive((index) => (index + direction + images.length) % images.length)

  return (
    <section className="gallery" aria-label={label}>
      <div className="gallery__frame">
        <img className="gallery__image" src={current.imageUrl} alt={current.caption || label} />
        {images.length > 1 && <>
          <button className="gallery__arrow gallery__arrow--prev" type="button" aria-label="Previous image" onClick={() => move(-1)}>‹</button>
          <button className="gallery__arrow gallery__arrow--next" type="button" aria-label="Next image" onClick={() => move(1)}>›</button>
        </>}
        {current.caption && <div className="gallery__caption">{current.caption}</div>}
      </div>
      {images.length > 1 && <div className="gallery__controls">
        <span className="u-xs u-faint">{active + 1} / {images.length}</span>
        <div className="gallery__dots">{images.map((image, index) => <button key={image.id} type="button" aria-label={`Show image ${index + 1}`} aria-current={index === active} className={index === active ? "gallery__dot is-active" : "gallery__dot"} onClick={() => setActive(index)} />)}</div>
      </div>}
    </section>
  )
}
