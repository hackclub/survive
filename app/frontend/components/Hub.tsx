import { Head, Link } from "@inertiajs/react"
import { Nav } from "./Nav"

import clouds from "../images/clouds.webp"
import mountains from "../images/mountains.webp"
import ground from "../images/ground.webp"
import vegetation from "../images/vegetation.webp"
import tentSpot from "../images/tent-spot.webp"
import campfireSpot from "../images/campfire-spot.webp"

export function Hub() {
  return (
    <>
      <Head title="Survive" />

      <main id="main" className="hub">
        <Nav over />

        <div className="hub__stage">
          <img className="hub__layer hub__layer--clouds" src={clouds} alt="" fetchPriority="high" />
          <img className="hub__layer" src={mountains} alt="" fetchPriority="high" />
          <img className="hub__layer" src={ground} alt="" fetchPriority="high" />
          <img className="hub__layer" src={vegetation} alt="" />

          <Link className="hub__spot hub__spot--tent" href="/camp" aria-label="Camp">
            <img className="hub__art" src={tentSpot} alt="" />
            <span className="hub__label" aria-hidden="true">
              Camp
            </span>
          </Link>

          <Link className="hub__spot hub__spot--fire" href="/shop" aria-label="Shop">
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
