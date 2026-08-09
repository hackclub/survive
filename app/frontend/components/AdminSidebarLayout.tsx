import { Link, usePage } from "@inertiajs/react"
import { Nav } from "./Nav"
import { Flash } from "./Flash"
import type { ReactNode } from "react"

export function AdminSidebarLayout({ children }: { children: ReactNode }) {
  const { url } = usePage()
  const path = url.split("?")[0]
  const isMyStats = path === "/admin/review/mystats"
  const isQueue = path.startsWith("/admin/review") && !isMyStats

  return (
    <>
      <Nav />

      <main id="main" className="admin-layout">
        <div className="admin-layout__shell">
          <aside className="admin-sidebar">
            <div className="admin-sidebar__section">
              <span className="u-label u-faint">Review</span>
              <Link
                className={`admin-sidebar__link${isQueue ? " is-active" : ""}`}
                href="/admin/review"
              >
                Queue
              </Link>
              <Link
                className={`admin-sidebar__link${isMyStats ? " is-active" : ""}`}
                href="/admin/review/mystats"
              >
                My stats
              </Link>
            </div>
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
