import type { ReactNode } from "react"
import { Link, usePage } from "@inertiajs/react"
import { Nav } from "./Nav"
import { Flash } from "./Flash"
import type { AuthUser, SharedProps } from "../types"

type Role = "admin" | "fraud" | "fulfiller"
type Item = { label: string; href: string; role: Role }
type Section = { label: string; items: Item[] }

const SECTIONS: Section[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", role: "admin" },
      { label: "Stats", href: "/admin/stats", role: "admin" },
    ],
  },
  { label: "Ari", items: [{ label: "Submissions", href: "/admin/reviews", role: "admin" }] },
  {
    label: "Payouts",
    items: [
      { label: "Final review", href: "/admin/final_reviews", role: "fraud" },
      { label: "Wood", href: "/admin/coins", role: "admin" },
      { label: "Shop items", href: "/admin/shop_items", role: "admin" },
      { label: "Orders", href: "/admin/orders", role: "admin" },
    ],
  },
  {
    label: "Shipping",
    items: [{ label: "Fulfillment", href: "/admin/fulfillment", role: "fulfiller" }],
  },
  {
    label: "Admin",
    items: [
      { label: "Users", href: "/admin/users", role: "admin" },
      { label: "Audit log", href: "/admin/audit_logs", role: "admin" },
      { label: "Hike Grants", href: "/admin/hike_grants", role: "admin" },
      { label: "Gallery images", href: "/admin/gallery_images", role: "admin" },\n    ],
  },
]

function allowed(user: AuthUser | null, role: Role) {
  if (!user) return false
  if (role === "fraud") return user.isFraud
  if (role === "fulfiller") return user.isFulfiller
  return user.isAdmin
}

function visibleSections(user: AuthUser | null) {
  return SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => allowed(user, item.role)),
  })).filter((section) => section.items.length > 0)
}

function isActive(path: string, href: string) {
  return href === "/admin" ? path === "/admin" : path.startsWith(href)
}

export function AdminSidebarLayout({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow?: string
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  const { url, props } = usePage<SharedProps>()
  const path = (url ?? "").split("?")[0]
  const sections = visibleSections(props.auth.user)

  return (
    <div className="shell">
      <header className="band band--cool">
        <Nav admin />

        {title && (
          <div className="band__inner">
            <div className="band__id">
              <div>
                {eyebrow && <p className="band__eyebrow">{eyebrow}</p>}
                <h1 className="band__title band__title--sm">{title}</h1>
              </div>
              {actions && <div className="band__actions">{actions}</div>}
            </div>
          </div>
        )}
      </header>

      <main id="main" className="admin-layout">
        <div className="admin-layout__shell">
          <aside className="admin-sidebar">
            {sections.map((section) => (
              <div key={section.label} className="admin-sidebar__section">
                <span className="u-label u-faint">{section.label}</span>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    className={`admin-sidebar__link${isActive(path, item.href) ? " is-active" : ""}`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </aside>

          <div className="admin-layout__content">{children}</div>
        </div>
      </main>

      <Flash />
    </div>
  )
}
