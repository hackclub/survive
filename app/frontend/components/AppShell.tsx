import type { ReactNode } from "react"
import { Nav } from "./Nav"
import { Dock } from "./Dock"
import { Flash } from "./Flash"
import { usePage } from "@inertiajs/react"
import type { SharedProps } from "../types"

type Stat = { label: string; value: string | number; tone?: "go" | "live" }

type Props = {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  actions?: ReactNode
  stats?: Stat[]
  narrow?: boolean
  wide?: boolean
  tone?: "cool" | "returned" | "paid"
  children: ReactNode
}

export function AppShell({
  eyebrow,
  title,
  lede,
  actions,
  stats,
  narrow,
  wide,
  tone,
  children,
}: Props) {
  const { auth } = usePage<SharedProps>().props

  return (
    <div className="shell">
      <header className={`band${tone ? ` band--${tone}` : ""}`}>
        <Nav />

        <div className={`band__inner${narrow ? " band__inner--narrow" : ""}${wide ? " band__inner--wide" : ""}`}>
          <div className="band__id">
            <div>
              {eyebrow && <p className="band__eyebrow">{eyebrow}</p>}
              <h1 className="band__title">{title}</h1>
              {lede && <p className="band__lede">{lede}</p>}
            </div>
            {actions && <div className="band__actions">{actions}</div>}
          </div>

          {stats && stats.length > 0 && (
            <div className="strip">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`strip__cell${stat.tone ? ` strip__cell--${stat.tone}` : ""}`}
                >
                  <b className="strip__number">{stat.value}</b>
                  <span className="strip__label">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main id="main" className={`shell__body${narrow ? " shell__body--narrow" : ""}${wide ? " shell__body--wide" : ""}`}>
        {children}
      </main>

      <Flash />
      {auth.user && <Dock />}
    </div>
  )
}
