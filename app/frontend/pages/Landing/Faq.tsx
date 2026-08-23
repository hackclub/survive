const QUESTIONS = [
  {
    q: "Can it use the internet to install dependencies?",
    a: "Yes. Install whatever you need.",
  },
  {
    q: "How much time should I spend working on my project?",
    a: "Whatever seems enough for your project! As long as you put effort, you're fine",
  },
  {
    q: "Can I work with someone else?",
    a: "TBD lol",
  },
  {
    q: "My project was rejected. Now what?",
    a: "You'll get notes explaining why, and you can fix it and resubmit.",
  },
]

export function Faq() {
  return (
    <section className="asks" id="faq">
      <div className="seam seam--bottom" aria-hidden="true">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            className="seam__back"
            d="M0,0 H1440 V74 L1380,52 L1320,88 L1256,44 L1200,66 L1140,94 L1076,58 L1010,86 L950,40 L890,72 L826,96 L760,54 L700,80 L634,48 L570,90 L508,62 L444,86 L380,50 L316,78 L250,96 L186,56 L120,84 L56,62 L0,90 Z"
          />
          <path
            className="seam__front"
            d="M0,0 H1440 V56 L1392,34 L1358,44 L1306,72 L1250,20 L1214,38 L1166,66 L1104,50 L1052,78 L996,26 L958,42 L902,70 L846,54 L790,82 L726,16 L686,36 L630,68 L574,46 L520,74 L458,24 L420,44 L362,70 L306,52 L250,80 L188,30 L150,50 L96,74 L40,58 L0,68 Z"
          />
        </svg>
      </div>

      <div className="wrap">
        <div className="asks__grid">
          <div className="asks__side">
            <p className="eyebrow" data-reveal>
              FAQ
            </p>
            <h2 className="u-d2" data-reveal style={{ "--i": 1, marginBlockStart: "1rem" } as React.CSSProperties}>
              Before you ask
            </h2>
            <p className="u-lead" data-reveal style={{ "--i": 2, marginBlockStart: "1rem" } as React.CSSProperties}>
              Still stuck? Ask in <span className="u-mono">#survive</span> on the Hack Club Slack.
            </p>
          </div>

          <div className="accordion" data-acc data-reveal style={{ "--i": 1 } as React.CSSProperties}>
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
