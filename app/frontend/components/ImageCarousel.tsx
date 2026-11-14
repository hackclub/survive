import { useRef, useState } from "react"

type Slide = { id: number; imageUrl: string; caption: string | null }

export function ImageCarousel({ images, label = "Gallery" }: { images: Slide[]; label?: string }) {
  const viewport = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  if (!images.length) return null

  function goTo(index: number) {
    const element = viewport.current
    if (!element) return
    element.scrollTo({ left: index * element.clientWidth, behavior: "smooth" })
  }

  function move(direction: number) {
    const element = viewport.current
    if (!element) return
    const next = (active + direction + images.length) % images.length
    element.scrollTo({ left: next * element.clientWidth, behavior: "smooth" })
  }

  function syncActive() {
    const element = viewport.current
    if (!element) return
    const next = Math.round(element.scrollLeft / Math.max(element.clientWidth, 1))
    setActive(Math.min(images.length - 1, Math.max(0, next)))
  }

  return (
    <section className="gallery" aria-label={label} aria-roledescription="carousel">
      <div className="gallery__frame">
        <div className="gallery__viewport" ref={viewport} onScroll={syncActive} tabIndex={0} aria-label="Swipe or scroll to browse images">
          <div className="gallery__track">
            {images.map((image, index) => (
              <article className="gallery__slide" key={image.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${images.length}`}>
                <img className="gallery__image" src={image.imageUrl} alt={image.caption || `${label} image ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} />
                {image.caption && <div className="gallery__caption">{image.caption}</div>}
              </article>
            ))}
          </div>
        </div>
        {images.length > 1 && <>
          <button className="gallery__arrow gallery__arrow--prev" type="button" aria-label="Previous image" onClick={() => move(-1)}>‹</button>
          <button className="gallery__arrow gallery__arrow--next" type="button" aria-label="Next image" onClick={() => move(1)}>›</button>
        </>}
      </div>
      {images.length > 1 && <div className="gallery__controls">
        <span className="u-xs u-faint">{active + 1} / {images.length}</span>
        <div className="gallery__dots" aria-label="Choose image">
          {images.map((image, index) => <button key={image.id} type="button" aria-label={`Show image ${index + 1}`} aria-current={index === active ? "true" : undefined} className={index === active ? "gallery__dot is-active" : "gallery__dot"} onClick={() => goTo(index)} />)}
        </div>
      </div>}
    </section>
  )
}
