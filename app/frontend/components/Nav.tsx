import { useEffect } from "react"
import { usePage } from "@inertiajs/react"
import { initNav } from "../lib/motion"
import mark from "../images/mark.webp"

export function Nav() {
  const { auth, signInPath, signOutPath } = usePage().props
  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

  useEffect(() => {
    const cleanups: Array<() => void> = []
    initNav(cleanups)
    return () => cleanups.forEach((fn) => fn())
  }, [])

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
          {auth.user ? (
            <>
              <span className="nav__who">
                {auth.user.avatar && <img className="nav__avatar" src={auth.user.avatar} alt="" />}
                {auth.user.displayName}
              </span>
              <a className="btn btn--ghost btn--sm" href="/shop">
                Shop
              </a>
              {auth.user.isAdmin && (
                <a className="btn btn--ghost btn--sm" href="/admin">
                  Admin
                </a>
              )}
              <form action={signOutPath} method="post">
                <input type="hidden" name="_method" value="delete" />
                <input type="hidden" name="authenticity_token" value={csrfToken} />
                <button className="btn btn--ghost btn--sm" type="submit">
                  Sign out
                </button>
              </form>
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
            </>
          ) : (
            <>
              <a className="btn btn--ghost btn--sm" href={signInPath}>
                Sign in
              </a>
              <a className="btn btn--primary btn--sm" href={signInPath}>
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
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
