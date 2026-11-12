import full from "../../images/full.webp"

const SURVIVE_LINKS = [
  { label: "Steps", href: "/#how" },
  { label: "FAQ", href: "/#faq" },
  { label: "Ship a project", href: "/camp" },
  { label: "Your dashboard", href: "/dashboard" },
]

const ELSEWHERE_LINKS = [
  { label: "Join our Slack", href: "https://slack.hackclub.com" },
  { label: "Hackatime", href: "https://hackatime.hackclub.com" },
  { label: "hackclub.com", href: "https://hackclub.com" },
  { label: "Code of conduct", href: "https://hackclub.com/conduct" },
]

export function Footer() {

  return (
    <footer className="footer">
      <div className="footer__scene" aria-hidden="true">
        <img className="footer__art" src={full} alt="" loading="lazy" />
      </div>

      <div className="wrap footer__inner">
        <div className="footer__cta">
          <h2>Start building</h2>
          <div className="row footer__ctaRow">
            <a className="btn btn--primary btn--lg" href="/camp">
              Ship a project
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
          </div>
        </div>

        <div className="footer__body">
          <div className="footer__intro">
            <p className="footer__lead">
              A YSWS by{" "}
              <a href="https://hackclub.com" target="_blank" rel="noreferrer">
                Hack Club
              </a>
            </p>
            <p className="footer__note">
              A 501(c)(3) nonprofit and a network of 60,000+ technical high schoolers. We think you
              learn best by building. Survive is the one where the wifi can't help you.
            </p>
          </div>

          <div className="footer__links">
            <div className="footer__col">
              <h4>Survive</h4>
              <div className="footer__list">
                {SURVIVE_LINKS.map(({ label, href }) => (
                  <a href={href} key={label}>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <div className="footer__col">
              <h4>Elsewhere</h4>
              <div className="footer__list">
                {ELSEWHERE_LINKS.map(({ label, href }) => (
                  <a href={href} target="_blank" rel="noreferrer" key={label}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="wrap footer__bottomRow">
          <span>Built offline, mostly</span>
        </div>
      </div>
    </footer>
  )
}
