import { useEffect } from "react"
import { Nav } from "../../components/Nav"
import { Trail } from "./Trail"
import { Faq } from "./Faq"
import { Footer } from "./Footer"
import { initMotion } from "../../lib/motion"

import mark from "../../images/mark.webp"
import clouds from "../../images/clouds.webp"
import mountains from "../../images/mountains.webp"
import ground from "../../images/ground.webp"
import vegetation from "../../images/vegetation.webp"
import tent from "../../images/tent.webp"
import campfire from "../../images/campfire.webp"

export default function Index() {
  useEffect(() => initMotion(), [])

  return (
    <>
      <Nav />

      <main id="main">
        <header className="scene" data-scene>
          <div className="scene__stack" aria-hidden="true">
            <div className="layer layer--clouds" data-depth="0.58" data-grow="0.02" data-sway="26">
              <img src={clouds} alt="" fetchPriority="high" />
            </div>
            <div
              className="layer layer--mountains"
              data-depth="0.44"
              data-grow="0.03"
              data-sway="18"
            >
              <img src={mountains} alt="" fetchPriority="high" />
            </div>
            <div className="layer layer--ground" data-depth="0.17" data-grow="0.08" data-sway="-10">
              <img src={ground} alt="" fetchPriority="high" />
            </div>
            <div
              className="layer layer--vegetation"
              data-depth="0.12"
              data-grow="0.09"
              data-sway="-18"
            >
              <img src={vegetation} alt="" />
            </div>
            <div className="scene__dusk"></div>
            <div className="layer layer--tent" data-depth="0.1" data-grow="0.1" data-sway="-22">
              <img src={tent} alt="" />
            </div>
            <div
              className="layer layer--campfire"
              data-depth="0.09"
              data-grow="0.1"
              data-sway="-24"
            >
              <img src={campfire} alt="" />
            </div>
            <div className="scene__floor"></div>
            <div className="scene__glow"></div>
            <div className="scene__embers" data-embers></div>
          </div>

          <div className="scene__content">
            <p className="scene__eyebrow">
              <img src={mark} alt="" />
              Hack Club - You Ship, We Ship
            </p>

            <h1 className="scene__title" data-split>
              Survive
            </h1>

            <p className="scene__lede">
              We're taking the internet away. Yes, all of it. No, you can't have it back.{" "}
              <b>Your app shouldn't die</b>
            </p>

            <div className="scene__cta">
              <a className="btn btn--primary btn--lg" href="/dashboard">
                Start building
                <svg className="btn__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h13m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a className="btn btn--outline-invert btn--lg" href="#how">
                How it works
              </a>
            </div>
          </div>

          <span className="scene__cue" aria-hidden="true">
            Scroll
          </span>
        </header>

        <Trail />
        <Faq />
      </main>

      <Footer />
    </>
  )
}
