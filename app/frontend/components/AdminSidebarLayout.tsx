import { Link, usePage } from "@inertiajs/react"
import { Nav } from "./Nav"
import { Flash } from "./Flash"
import type { ReactNode } from "react"

type Item = { label: string; href: string }
type Section = { label: string; items: Item[] }

const SECTIONS: Section[] = [
  { label: "Ari", items: [{ label: "Submissions", href: "/admin/reviews" }] },
  { label: "Payouts", items: [{ label: "Final review", href: "/admin/final_reviews" }] },
]

export function AdminSidebarLayout({ children }: { children: ReactNode }) {
  const { url } = usePage()
  const path = url.split("?")[0]

  return (
    <>
      <Nav />

      <main id="main" className="admin-layout">
        <div className="admin-layout__shell">
          <aside className="admin-sidebar">
            {SECTIONS.map((section) => (
              <div key={section.label} className="admin-sidebar__section">
                <span className="u-label u-faint">{section.label}</span>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    className={`admin-sidebar__link${path.startsWith(item.href) ? " is-active" : ""}`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </aside>

          <div className="admin-layout__content">
            <Flash />
            {children}
          </div>
        </div>
      </main>
    </>
  )
}
