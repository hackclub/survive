import { Link, usePage } from "@inertiajs/react"

const ITEMS = [
  {
    label: "Camp",
    href: "/camp",
    path: "M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z",
  },
  {
    label: "Shop",
    href: "/shop",
    path: "M4 8h16l-1.2 11.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8zM9 8V6a3 3 0 0 1 6 0v2",
  },
  {
    label: "Orders",
    href: "/orders",
    path: "M3 7h13v10H3zM16 10h3.5l1.5 3v4h-5z",
  },
  {
    label: "You",
    href: "/account",
    path: "M12 4.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2M4.5 20a7.5 7.5 0 0 1 15 0",
  },
]

function isActive(path: string, href: string) {
  if (href === "/camp") return path === "/camp" || path.startsWith("/projects")
  return path.startsWith(href)
}

export function Dock() {
  const { url } = usePage()
  const path = (url ?? "").split("?")[0]

  return (
    <nav className="dock" aria-label="Sections">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          className={`dock__link${isActive(path, item.href) ? " is-active" : ""}`}
          href={item.href}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={item.path} />
          </svg>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
