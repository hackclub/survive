import raccoon from "../../images/raccoon.webp"

const STEPS = [
  {
    id: "sign-in",
    title: "Sign in",
    body: "Use your Hack Club account. If you don't have one, it only takes a minute to make.",
  },
  {
    id: "build",
    title: "Build something",
    body: "Make a project that either works without internet or has something to do with the outdoors.",
  },
  {
    id: "track",
    title: (
      <>
        Track your time with{" "}
        <a href="https://hackatime.hackclub.com/" target="_blank" rel="noreferrer">
          Hackatime
        </a>
      </>
    ),
    body: "Leave Hackatime running while you code. Only the hours it logs count toward your wood.",
  },
  {
    id: "ship",
    title: "Ship it",
    body: "Drop in your repo link, tell us what you made, and send it off for review.",
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
