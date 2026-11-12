import { Head } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"

function Section({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="card" style={{ padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
      <p className="u-label u-faint">{number}</p>
      <h2 className="u-h3" style={{ margin: "var(--sp-1) 0 var(--sp-2)" }}>{title}</h2>
      <div className="u-soft">{children}</div>
    </section>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: "var(--sp-2)" }}>{children}</li>
}

export default function HikeGrants() {
  return (
    <>
      <Head title="Hike Grants - Admin - Survive" />
      <AdminSidebarLayout eyebrow="Admin · Ideas" title="🥾 Hike Grants">
        <div style={{ maxWidth: 900 }}>
          <div className="card" style={{ padding: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
            <p className="u-label u-faint">Concept proposal · Not yet launched</p>
            <p className="u-lead" style={{ marginTop: "var(--sp-2)" }}>
              Help Hack Clubbers get outside together. Participants opt in, find other people in
              their region, organise a group hike and request one shared grant to make it happen.
            </p>
            <p className="u-sm u-faint" style={{ marginTop: "var(--sp-3)" }}>
              This is an internal planning page. No participant sign-ups, grant applications,
              payouts or location data are collected by this page.
            </p>
          </div>

          <div className="mystats__grid" style={{ marginBottom: "var(--sp-4)" }}>
            <div className="mystats__tile"><span className="mystats__number">1</span><span className="u-xs u-faint">Grant per hike</span></div>
            <div className="mystats__tile"><span className="mystats__number">5 / hr</span><span className="u-xs u-faint">Proposed funding rate · clarify</span></div>
            <div className="mystats__tile"><span className="mystats__number">HCB</span><span className="u-xs u-faint">Card grant payouts</span></div>
          </div>

          <Section number="01 · DISCOVER" title="Opt-in regional matching">
            <ul>
              <Item>Participants explicitly opt in to appear on a “Hikers near you” page.</Item>
              <Item>Show city or broad region only. Never show exact addresses or live locations.</Item>
              <Item>Let people discover potential hiking groups without exposing personal location details.</Item>
            </ul>
          </Section>

          <Section number="02 · ORGANISE" title="Create a hike and bring a group together">
            <ul>
              <Item>A participant starts a hike with a trail, public meeting point and date.</Item>
              <Item>Other opted-in participants can view the plan and request to join.</Item>
              <Item>Each hike gets a group conversation space so attendees can coordinate plans, transport and what to bring.</Item>
              <Item>Use clear participant limits, organiser details and safety expectations before a hike is confirmed.</Item>
            </ul>
          </Section>

          <Section number="03 · FUND" title="One grant request per hike">
            <ul>
              <Item>One application covers the whole group, rather than separate requests from every hiker.</Item>
              <Item>Break the budget into travel, picnic food and required gear.</Item>
              <Item>Set a per-person cap and calculate the total request from the confirmed group size.</Item>
              <Item>All requests receive human review before any money is committed.</Item>
              <Item>Approved funds are distributed as HCB card grants, with clear spending and receipt requirements.</Item>
            </ul>
          </Section>

          <Section number="04 · AFTER THE HIKE" title="Close-out and continued eligibility">
            <ul>
              <Item>The organiser submits a group photo and a short write-up after the hike.</Item>
              <Item>Record whether the grant was used as approved and whether any funds need to be reconciled.</Item>
              <Item>Submitting the close-out keeps the group eligible for future Hike Grants.</Item>
            </ul>
          </Section>

          <Section number="05 · EXPLORE" title="World map of planned hikes">
            <ul>
              <Item>Show planned hikes on a world map using approximate public trail or meeting-point locations.</Item>
              <Item>Map pins open a hike summary with date, region, trail and available places.</Item>
              <Item>Do not map participant homes, exact personal locations or private travel details.</Item>
            </ul>
            <p className="u-sm u-faint">Map is a proposed feature; no live hikes are displayed yet.</p>
          </Section>

          <Section number="06 · FUNDING MODEL" title="Entry rate and hourly funding">
            <ul>
              <Item>Explore a consistent entry rate so every hiker contributes the same amount, with the rate visible before joining.</Item>
              <Item>The proposal also mentions “5/hour of funding”. Confirm the currency, whether this means per hiker-hour or per hike-hour, and how it interacts with the entry rate.</Item>
              <Item>Publish the per-person cap and total available funding before applications open.</Item>
            </ul>
          </Section>

          <section className="card" style={{ padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
            <p className="u-label u-faint">Before launch · Admin decisions</p>
            <ul style={{ marginTop: "var(--sp-2)" }}>
              <Item>Confirm what “5/hour” means and set the currency and calculation.</Item>
              <Item>Decide the shared entry rate, per-person grant cap and overall grant budget.</Item>
              <Item>Define eligibility, minimum/maximum group size and organiser responsibilities.</Item>
              <Item>Agree on safeguarding, consent, emergency contacts, weather cancellation and transport rules.</Item>
              <Item>Confirm HCB card grant logistics, receipts, unused funds and approval ownership.</Item>
              <Item>Choose how the map, opt-in directory and group chat will be built and moderated.</Item>
            </ul>
          </section>
        </div>
      </AdminSidebarLayout>
    </>
  )
}
