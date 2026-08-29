import { Head } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"

const sections = [
  {
    id: "getting-started",
    title: "Getting started",
    body: "Survive is where you turn the time you spend making things into real-world rewards. Start by connecting your Hackatime account, then create a project and keep building.",
  },
  {
    id: "projects",
    title: "Projects",
    body: "Create a project for something you are actively building. Link the relevant Hackatime project so your work can be tracked, then keep your project details up to date as you make progress.",
  },
  {
    id: "the-trail",
    title: "The trail",
    body: "Projects move through a review trail as they are submitted and checked. Keep an eye on your camp dashboard to see where each project is and what needs your attention.",
  },
  {
    id: "wood",
    title: "Wood",
    body: "Wood is Survive's currency. You earn it from approved work and can spend your spendable balance in the shop. Wood used by an order may be held until the order is reviewed or fulfilled.",
  },
  {
    id: "shop-orders",
    title: "Shop & orders",
    body: "Browse the shop to see what you can redeem your wood for. After placing an order, you can follow its status from Orders. If an order is rejected, its held wood is returned to your purse.",
  },
  {
    id: "reviews",
    title: "Reviews",
    body: "Reviews help make sure projects meet the requirements before wood is awarded. If your project is sent back, read the feedback, make the needed changes, and submit it again.",
  },
]

export default function Show() {
  return (
    <>
      <Head title="Docs - Survive" />

      <AppShell
        eyebrow="Docs"
        title="How Survive works"
        narrow
        lede="Everything you need to know about projects, the trail, wood, and the shop."
      >
        <div className="docs">
          <aside className="docs__toc panel">
            <div className="panel__head">
              <h2 className="panel__title">On this page</h2>
            </div>
            <nav aria-label="Documentation sections">
              {sections.map((section) => (
                <a key={section.id} className="docs__toc-link" href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="docs__content">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="panel docs__section">
                <p className="band__eyebrow">{section.title}</p>
                <h2 className="docs__title">{section.title}</h2>
                <p className="docs__body">{section.body}</p>
              </section>
            ))}
          </article>
        </div>
      </AppShell>
    </>
  )
}
