const QUESTIONS = [
  {
    q: "What type of projects can I make?",
    a: "Anything that works entirely offline, or is themed outside. This could be a sandbox game, an adventure game, or a tool that works entirely offline",
  },
  {
    q: "How much time should I spend working on my project?",
    a: "Whatever seems enough for your project! As long as you put effort, you're fine",
  },
  {
    q: "Can I work with someone else?",
    a: "Yes! Just make individual projects and only record the time you do.",
  },
  {
    q: "My project was rejected. Now what?",
    a: "You'll get notes explaining why, and you can fix it and resubmit.",
  },
]

export function Faq() {
  return (
    <section className="asks" id="faq">
      <div className="wrap">
        <div className="asks__grid">
          <div className="asks__side">
            <p className="eyebrow">FAQ</p>
            <h2 className="u-d2 asks__heading">Before you ask</h2>
            <p className="u-lead asks__note">
              Still stuck? Ask in <span className="u-mono">#survive</span> on the Hack Club Slack.
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
