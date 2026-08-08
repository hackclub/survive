import mark from "../images/mark.webp"

export function Nav() {
  return (
    <nav className="nav" data-nav>
      <div className="nav__shell">
        <a className="brand" href="/">
          <img className="brand__mark" src={mark} alt="" />
          <span className="brand__name">Survive</span>
        </a>

        <button
          className="nav__burger"
          type="button"
          data-burger
          aria-expanded="false"
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="nav__links">
          <a className="nav__link is-active" href="/">
            How it works
          </a>
          <a className="nav__link" href="/gallery">
            Gallery
          </a>
          <a className="nav__link" href="#faq">
            FAQ
          </a>
        </div>

        <div className="nav__actions">
          <a className="btn btn--ghost btn--sm" href="/dashboard">
            Sign in
          </a>
          <a className="btn btn--primary btn--sm" href="/dashboard">
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
    </nav>
  )
}
