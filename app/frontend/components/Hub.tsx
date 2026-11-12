import { Head, Link, usePage } from "@inertiajs/react"
import { useImagesReady } from "../lib/useImagesReady"
import { formatMinutes } from "../lib/format"
import { Purse } from "./Purse"
import type { SharedProps } from "../types"
import mark from "../images/mark.webp"
import clouds from "../images/clouds.webp"
import mountains from "../images/mountains.webp"
import ground from "../images/ground.webp"
import vegetation from "../images/vegetation.webp"
import tentSpot from "../images/tent-spot.webp"
import campfireSpot from "../images/campfire-spot.webp"

export type HubCamp = {
  projects: number
  inReview: number
  changes: number
  drafts: number
  approvedMinutes: number
  next: { id: number; name: string; stage: "changes" | "draft" } | null
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 5) return "Up late"
  if (hour < 12) return "Morning"
  if (hour < 18) return "Afternoon"
  return "Evening"
}

function NextStep({ camp }: { camp: HubCamp }) {
  if (camp.next?.stage === "changes") {
    return (
      <Link className="hud-card__next hud-card__next--alert" href={`/projects/${camp.next.id}`}>
        <b>{camp.next.name}</b> needs changes before it can ship. Take a look →
      </Link>
    )
  }

  if (camp.next?.stage === "draft") {
    return (
      <Link className="hud-card__next" href={`/projects/${camp.next.id}`}>
        Pick up <b>{camp.next.name}</b> where you left it →
      </Link>
    )
  }

  if (camp.projects === 0) {
    return <p className="hud-card__next">Build something offline or outdoors, log it on Hackatime, and ship it for wood.</p>
  }

  if (camp.inReview > 0) {
    return <p className="hud-card__next">Reviewers have your work. Nothing is needed from you right now.</p>
  }

  return <p className="hud-card__next">Everything is shipped. Start the next build.</p>
}

export function Hub({ camp }: { camp: HubCamp }) {
  const { auth } = usePage<SharedProps>().props
  const user = auth.user
  const [stage, ready] = useImagesReady<HTMLDivElement>()

  const stats = [
    { label: camp.projects === 1 ? "project" : "projects", value: camp.projects },
    { label: "in review", value: camp.inReview },
    { label: "approved", value: formatMinutes(camp.approvedMinutes) },
  ]

  return (
    <>
      <Head title="Survive" />

      <main id="main" className="hub">
        <div ref={stage} className="hub__stage" data-ready={ready || undefined}>
          <img className="hub__layer hub__layer--clouds" src={clouds} alt="" fetchPriority="high" />
          <img className="hub__layer" src={mountains} alt="" fetchPriority="high" />
          <img className="hub__layer" src={ground} alt="" fetchPriority="high" />
          <img className="hub__layer" src={vegetation} alt="" fetchPriority="high" />

          <Link className="hub__spot hub__spot--tent" href="/camp" prefetch>
            <img className="hub__art" src={tentSpot} alt="" />
            <span className="hub__label">
              Camp
              <small>{camp.projects === 0 ? "Start here" : `${camp.projects} ${camp.projects === 1 ? "project" : "projects"}`}</small>
            </span>
          </Link>

          <Link className="hub__spot hub__spot--fire" href="/shop" prefetch>
            <img className="hub__art" src={campfireSpot} alt="" />
            <span className="hub__label">
              Shop
              <small>{user ? `${user.coins.spendable} wood to spend` : "Trade wood for gear"}</small>
            </span>
          </Link>
        </div>

        <header className="hud-bar">
          <span className="hud-brand">
            <img src={mark} alt="" />
            Survive
          </span>

          {user && (
            <div className="hud-bar__actions">
              <Purse
                spendable={user.coins.spendable}
                earned={user.coins.earned}
                adjusted={user.coins.adjusted}
                held={user.coins.held}
                heldOrders={user.coins.heldOrders}
              />
              <Link className="hud-bar__link" href="/hike_grants" prefetch>Hikes</Link>
              <Link className="hud-bar__link" href="/orders" prefetch>
                Orders
                {user.ordersChanged && <span className="nav__dot" />}
              </Link>
              <Link className="hud-bar__link" href="/docs" prefetch>
                Docs
              </Link>
              <Link className="hud-bar__link" href="/account" prefetch>
                You
              </Link>
            </div>
          )}
        </header>

        <section className="hud-card" aria-label="Your camp">
          <p className="hud-card__hello">
            {greeting()}, {user?.displayName ?? "camper"}
          </p>

          {camp.projects > 0 && (
            <dl className="hud-card__stats">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <NextStep camp={camp} />

          <div className="hud-card__actions">
            <Link className="btn btn--primary" href="/projects/new" prefetch>
              {camp.projects === 0 ? "Start your first project" : "New project"}
            </Link>
            {camp.projects > 0 && (
              <Link className="btn btn--outline-invert" href="/camp" prefetch>
                Open camp
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
