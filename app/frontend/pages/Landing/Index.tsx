import { useEffect } from "react"
import { Head, usePage } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import { ImageCarousel } from "../../components/ImageCarousel"
import { Trail } from "./Trail"
import { Faq } from "./Faq"
import { Footer } from "./Footer"
import { initMotion } from "../../lib/motion"
import { useImagesReady } from "../../lib/useImagesReady"
import type { SharedProps } from "../../types"

import mark from "../../images/mark.webp"
import clouds from "../../images/clouds.webp"
import mountains from "../../images/mountains.webp"
import ground from "../../images/ground.webp"
import vegetation from "../../images/vegetation.webp"
import tent from "../../images/tent.webp"
import campfire from "../../images/campfire.webp"

export default function Index() {
  const { signInPath } = usePage<SharedProps>().props
  const [stack, ready] = useImagesReady<HTMLDivElement>()

  useEffect(() => initMotion(), [])

  return (
    <>
      <Head title="Survive - Build it. Ship it. Get paid for it.">
        <meta
          name="description"
          content="A Hack Club You Ship, We Ship program. Log your hours, ship a real project, and take wood for every approved hour."
        />
      </Head>

      <main id="main">
        <header className="scene">
          <Nav over />

          <div ref={stack} className="scene__stack" data-ready={ready || undefined} aria-hidden="true">
            <div className="layer layer--clouds">
              <img src={clouds} alt="" fetchPriority="high" />
            </div>
            <div className="layer layer--mountains">
              <img src={mountains} alt="" fetchPriority="high" />
            </div>
            <div className="layer layer--ground">
              <img src={ground} alt="" fetchPriority="high" />
            </div>
            <div className="layer layer--vegetation">
              <img src={vegetation} alt="" fetchPriority="high" />
            </div>
            <div className="scene__dusk"></div>
            <div className="layer layer--tent">
              <img src={tent} alt="" />
            </div>
            <div className="layer layer--campfire">
              <img src={campfire} alt="" />
            </div>
          </div>

          <div className="scene__content">
            <p className="scene__eyebrow">
              <img src={mark} alt="" />
              Hack Club, sponsored by Johnny
            </p>

            <h1 className="scene__title">
              Survive
            </h1>

            <p className="scene__lede">
              Make offline and outdoors projects, earn camping prizes and much more.
            </p>

            <div className="scene__cta">
              <a className="btn btn--primary btn--lg" href={signInPath}>
                Sign in
              </a>
            </div>
          </div>
        </header>

        {galleryImages.length > 0 && <div className="wrap" style={{ paddingTop: "var(--sp-6)" }}><ImageCarousel images={galleryImages} label="Survive community gallery" /></div>}
        <Trail />
        <Faq />
      </main>

      <Footer />
    </>
  )
}
