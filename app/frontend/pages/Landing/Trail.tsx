import mountains from "../../images/mountains.webp"
import raccoon from "../../images/raccoon.webp"

const STEPS = [
  {
    title: "Sign in",
    body: "One click with your Hack Club account. If you don't have one yet, making it takes about a minute.",
  },
  {
    title: "Build the thing",
    body: "Build your cool project and track your time using hackatime",
  },
  {
    title: "Ship it",
    body: "Paste the repo link, describe your project, and send it for review!",
  },
  {
    title: "Get reviewed",
    body: "We'll review your project and make sure it works offline and you'll get the verdict! (hopefully accepted)",
  },
]

export function Trail() {
  return (
    <section className="trail" id="how">
      <div className="sunrise" aria-hidden="true"></div>
      <div className="sunrise__ridge" aria-hidden="true">
        <img src={mountains} alt="" loading="lazy" />
      </div>
      <div className="sunrise__sun" aria-hidden="true"></div>

      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow" data-reveal>
            How it goes
          </p>
        </div>

        <div className="trail__grid">
          <div className="trail__guide" aria-hidden="true">
            <img className="trail__walker" src={raccoon} alt="" loading="lazy" />
          </div>

          <ol className="trail__steps">
            {STEPS.map((step, i) => (
              <li className="tstep" data-reveal style={{ "--i": i } as React.CSSProperties} key={step.title}>
                <span className="tstep__dot">{i + 1}</span>
                <div className="tstep__card">
                  <div>
                    <h3 className="tstep__title">{step.title}</h3>
                    <p className="tstep__body">{step.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
