import raccoon from "../../images/raccoon.webp"

const STEPS = [
  {
    id: "sign-in",
    title: "Sign in",
    body: "One click with your Hack Club account. If you don't have one yet, making it takes about a minute.",
  },
  {
    id: "build",
    title: "Build the thing",
    body: "Build your cool project, either offline or outdoors themed.",
  },
  {
    id: "track",
    title: (
      <>
        Track it with{" "}
        <a href="https://hackatime.hackclub.com" target="_blank" rel="noreferrer">
          Hackatime
        </a>
      </>
    ),
    body: "Log your hours as you build, so the time you put in is counted.",
  },
  {
    id: "ship",
    title: "Ship it",
    body: "Paste the repo link, describe your project, and send it for review!",
  },
]

export function Trail() {
  return (
    <section className="trail" id="how">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow">Steps</p>
        </div>

        <div className="trail__grid">
          <div className="trail__guide" aria-hidden="true">
            <img className="trail__walker" src={raccoon} alt="" loading="lazy" />
          </div>

          <ol className="trail__steps">
            {STEPS.map((step, i) => (
              <li className="tstep" key={step.id}>
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
