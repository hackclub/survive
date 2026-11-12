import { Head, Link } from "@inertiajs/react"
import { useImagesReady } from "../lib/useImagesReady"
import clouds from "../images/clouds.webp"
import mountains from "../images/mountains.webp"
import ground from "../images/ground.webp"
import vegetation from "../images/vegetation.webp"
import tentSpot from "../images/tent-spot.webp"
import campfireSpot from "../images/campfire-spot.webp"

export function Hub() {
  const [stage, ready] = useImagesReady<HTMLDivElement>()

  return (
    <>
      <Head title="Survive" />

      <main id="main" className="hub">
        <div ref={stage} className="hub__stage" data-ready={ready || undefined}>
          <img className="hub__layer hub__layer--clouds" src={clouds} alt="" fetchPriority="high" />
          <img className="hub__layer" src={mountains} alt="" fetchPriority="high" />
          <img className="hub__layer" src={ground} alt="" fetchPriority="high" />
          <img className="hub__layer" src={vegetation} alt="" fetchPriority="high" />

          <Link className="hub__spot hub__spot--tent" href="/camp" aria-label="Camp" prefetch>
            <img className="hub__art" src={tentSpot} alt="" />
            <span className="hub__label" aria-hidden="true">
              Camp
            </span>
          </Link>

          <Link className="hub__spot hub__spot--fire" href="/shop" aria-label="Shop" prefetch>
            <img className="hub__art" src={campfireSpot} alt="" />
            <span className="hub__label" aria-hidden="true">
              Shop
            </span>
          </Link>
        </div>
      </main>
    </>
  )
}
