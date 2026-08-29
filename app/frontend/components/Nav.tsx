import { useEffect, useRef, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { Purse } from "./Purse"
import mark from "../images/mark.webp"
import type { SharedProps } from "../types"

const LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Camp", href: "/camp" },
  { label: "Shop", href: "/shop" },
  { label: "Orders", href: "/orders" },
]

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function isActive(path: string, href: string) {
  if (href === "/camp") return path === "/camp" || path.startsWith("/projects")
  if (href === "/dashboard") return path === "/dashboard"
  return path.startsWith(href)
}

export function Nav({ over, admin }: { over?: boolean; admin?: boolean } = {}) {
  const page = usePage<SharedProps>()
  const { auth, signInPath, signOutPath } = page.props
  const path = (page.url ?? "").split("?")[0]
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

  useEffect(() => {
    if (!open) return

    const onAway = (event: MouseEvent) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onAway)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onAway)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const user = auth.user

  return (
    <nav className={`nav${over ? " nav--over" : ""}`}>
      <Link className="brand" href={user ? "/dashboard" : "/"}>
        <img className="brand__mark" src={mark} alt="" />
        <span className="brand__name">Survive</span>
      </Link>

      {user && admin && (
        <Link className="nav__ghost" href="/camp">
          Back to camp
        </Link>
      )}

      {user && !admin && (
        <div className="nav__seg">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              className={`nav__link${isActive(path, link.href) ? " is-active" : ""}`}
              href={link.href}
            >
              {link.label}
              {link.href === "/orders" && user.ordersChanged && <span className="nav__dot" />}
            </Link>
          ))}
          <Link
            className={`nav__link${path === "/docs" ? " is-active" : ""}`}
            href="/docs"
          >
            Docs
          </Link>
        </div>
      )}

      <div className="nav__spacer" />

      <div className="nav__actions">
        {user ? (
          <>
            <Purse
              spendable={user.coins.spendable}
              earned={user.coins.earned}
              adjusted={user.coins.adjusted}
              held={user.coins.held}
              heldOrders={user.coins.heldOrders}
            />

            <div className="nav__menu" ref={menu}>
              <button
                type="button"
                className="avatar"
                aria-expanded={open}
                aria-label="Your account"
                onClick={() => setOpen((value) => !value)}
              >
                {user.avatar ? <img src={user.avatar} alt="" /> : initials(user.displayName)}
              </button>

              {open && (
                <div className="nav__sheet">
                  <div className="nav__sheet-head">
                    <p className="u-sm" style={{ fontWeight: 700 }}>
                      {user.displayName}
                    </p>
                    <p className="u-xs u-faint">{user.email}</p>
                  </div>
                  <Link href="/account">You</Link>
                  {(user.isAdmin || user.isFraud || user.isFulfiller) && (
                    <Link
                      href={
                        user.isAdmin
                          ? "/admin"
                          : user.isFraud
                            ? "/admin/final_reviews"
                            : "/admin/fulfillment"
                      }
                    >
                      Admin
                    </Link>
                  )}
                  <form action={signOutPath} method="post">
                    <input type="hidden" name="_method" value="delete" />
                    <input type="hidden" name="authenticity_token" value={csrfToken} />
                    <button type="submit">Sign out</button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a className="btn btn--primary btn--sm" href={signInPath}>
              Sign in
            </a>
          </>
        )}
      </div>
    </nav>
  )
}
