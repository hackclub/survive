const survive = <span className="u-mono">#survive</span>

const QUESTIONS = [
  {
    q: "What can I make?",
    a: (
      <>
        Anything that runs fully offline, or anything about being outside. A survival game, a trail map that works
        with no signal, a campfire timer, a weather station. If you're not sure your idea fits, ask in {survive}.
      </>
    ),
  },
  {
    q: "How long should I spend on it?",
    a: "As long as it takes to make something you're proud of. You earn wood for every hour Hackatime logs, so more time means more wood.",
  },
  {
    q: "Can I work with someone else?",
    a: "Yep! Team up with friends if you want. Each person needs to track their own time in Hackatime, and you'll each get wood for the hours you put in.",
  },
  {
    q: "My project got rejected. Now what?",
    a: "Read the reviewer's note, fix what they flagged, and send it in again. A rejection just means \"not yet.\"",
  },
]

export function Faq() {
  return (
    <section className="asks" id="faq">
      <div className="wrap">
        <div className="asks__grid">
          <div className="asks__side">
            <p className="eyebrow">FAQ</p>
            <p className="u-lead asks__note">
              Still stuck? Ask in {survive} on the Hack Club Slack.
            </p>
          </div>

          <div className="accordion" data-acc>
            {QUESTIONS.map(({ q, a }, i) => (
              <div className={`acc${i === 0 ? " is-open" : ""}`} key={q}>
                <button className="acc__btn" type="button" aria-expanded={i === 0}>
                  {q}
                  <span className="acc__sign" aria-hidden="true"></span>
                </button>
                <div className="acc__panel" aria-hidden={i !== 0}>
                  <div className="acc__inner">
                    <div>{a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
