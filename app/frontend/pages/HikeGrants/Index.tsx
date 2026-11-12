import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { Status } from "../../components/Status"

type Participant = { id: number; name: string; email: string; allocationCents: number }
type Grant = {
  id: number; name: string; trail: string; region: string; meetingPoint: string
  startsAt: string; budgetCents: number; status: string; decisionReason: string | null
  participants: Participant[]
}

const money = (cents: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100)
const tone = (status: string): "neutral" | "ok" | "warn" | "bad" =>
  status === "approved" || status === "paid" || status === "completed" ? "ok" :
  status === "rejected" ? "bad" : status === "pending" ? "warn" : "neutral"

export default function Index({ grants }: { grants: Grant[] }) {
  const [name, setName] = useState("")
  const [trail, setTrail] = useState("")
  const [region, setRegion] = useState("")
  const [meetingPoint, setMeetingPoint] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [budget, setBudget] = useState("")
  const [emails, setEmails] = useState("")
  const [adding, setAdding] = useState<number | null>(null)
  const [newEmails, setNewEmails] = useState("")

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.post("/hike_grants", { hike_grant: { name, trail, region, meeting_point: meetingPoint, starts_at: startsAt, budget }, participant_emails: emails })
  }

  function addPeople(id: number) {
    router.post(`/hike_grants/${id}/add_participants`, { participant_emails: newEmails }, {
      onSuccess: () => { setAdding(null); setNewEmails("") },
    })
  }

  return (
    <>
      <Head title="My Hikes - Survive" />
      <main id="main" className="page" style={{ maxWidth: 1000, margin: "0 auto", padding: "var(--sp-5) var(--sp-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap" }}>
          <div><p className="u-label u-faint">Survive · Community</p><h1 className="u-h1">🥾 Organise a hike</h1><p className="u-sm u-soft">Submit a group hike for funding review and manage your participants.</p></div>
          <Link className="btn btn--quiet" href="/dashboard">← Dashboard</Link>
        </div>

        <form className="card" onSubmit={submit} style={{ padding: "var(--sp-4)", marginTop: "var(--sp-4)", display: "grid", gap: "var(--sp-3)" }}>
          <h2 className="u-h3">Submit a hike</h2>
          <div className="form-grid">
            <label className="field"><span className="field__label">Hike name</span><input className="field__input" required value={name} onChange={e => setName(e.target.value)} placeholder="Blue Mountains day hike" /></label>
            <label className="field"><span className="field__label">Trail</span><input className="field__input" required value={trail} onChange={e => setTrail(e.target.value)} placeholder="Grand Canyon Track" /></label>
            <label className="field"><span className="field__label">Region</span><input className="field__input" required value={region} onChange={e => setRegion(e.target.value)} placeholder="Sydney, NSW" /></label>
            <label className="field"><span className="field__label">Public meeting point</span><input className="field__input" required value={meetingPoint} onChange={e => setMeetingPoint(e.target.value)} placeholder="Central Station, main concourse" /></label>
            <label className="field"><span className="field__label">Date and time</span><input className="field__input" type="datetime-local" required value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label>
            <label className="field"><span className="field__label">Total budget (AUD)</span><input className="field__input" type="number" min="0.01" step="0.01" required value={budget} onChange={e => setBudget(e.target.value)} /></label>
          </div>
          <label className="field"><span className="field__label">Participant emails</span><textarea className="field__input" rows={3} required value={emails} onChange={e => setEmails(e.target.value)} placeholder="one@hackclub.com, two@hackclub.com" /><span className="u-xs u-faint">Only registered Survive accounts can be added. Separate emails with commas or new lines. The budget is split evenly between everyone.</span></label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn--primary" type="submit">Submit hike for review</button></div>
        </form>

        <section style={{ marginTop: "var(--sp-5)" }}>
          <h2 className="u-h2">Your submitted hikes</h2>
          {grants.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">You haven't submitted a hike yet.</p></div> : (
            <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
              {grants.map(grant => <article className="card" key={grant.id} style={{ padding: "var(--sp-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}>
                  <div><div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center", flexWrap: "wrap" }}><h3 className="u-h3">{grant.name}</h3><Status tone={tone(grant.status)}>{grant.status}</Status></div><p className="u-sm u-soft">{grant.trail} · {grant.region} · {grant.startsAt}</p><p className="u-xs u-faint">Meet at {grant.meetingPoint}</p></div>
                  <div><strong className="u-h3">{money(grant.budgetCents)}</strong><p className="u-xs u-faint">{grant.participants.length} hikers</p></div>
                </div>
                {grant.decisionReason && <p className="u-sm" style={{ marginTop: "var(--sp-2)" }}>Review note: {grant.decisionReason}</p>}
                <div style={{ overflowX: "auto", marginTop: "var(--sp-3)" }}><table className="data-table"><thead><tr><th>Hiker</th><th>Budget share</th></tr></thead><tbody>{grant.participants.map(person => <tr key={person.id}><td><strong>{person.name}</strong><div className="u-xs u-faint">{person.email}</div></td><td>{money(person.allocationCents)}</td></tr>)}</tbody></table></div>
                {grant.status === "pending" && <div style={{ marginTop: "var(--sp-3)" }}>
                  {adding === grant.id ? <div style={{ display: "grid", gap: "var(--sp-2)" }}><label className="field"><span className="field__label">Add participant emails</span><textarea className="field__input" rows={2} value={newEmails} onChange={e => setNewEmails(e.target.value)} placeholder="three@hackclub.com, four@hackclub.com" /></label><p className="u-xs u-faint">Everyone's share will be recalculated evenly across the full group.</p><div style={{ display: "flex", gap: "var(--sp-2)", justifyContent: "flex-end" }}><button className="btn btn--quiet btn--sm" type="button" onClick={() => setAdding(null)}>Cancel</button><button className="btn btn--primary btn--sm" type="button" disabled={!newEmails.trim()} onClick={() => addPeople(grant.id)}>Add people</button></div></div> : <button className="btn btn--quiet btn--sm" type="button" onClick={() => { setAdding(grant.id); setNewEmails("") }}>＋ Add people to this hike</button>}
                </div>}
                {grant.status !== "pending" && <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>Participant changes are closed once the hike has been reviewed.</p>}
              </article>)}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
