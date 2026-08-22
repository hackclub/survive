import { Link } from "@inertiajs/react"

export type TabItem = {
  label: string
  href: string
  count?: number
  active?: boolean
}

export function Tabs({ items }: { items: TabItem[] }) {
  return (
    <nav className="tabs">
      {items.map((item) => (
        <Link key={item.href} className={`tab${item.active ? " is-active" : ""}`} href={item.href}>
          {item.label}
          {item.count !== undefined && <span className="tab__count">{item.count}</span>}
        </Link>
      ))}
    </nav>
  )
}
