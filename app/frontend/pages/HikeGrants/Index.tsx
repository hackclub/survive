import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { Status } from "../../components/Status"

type Participant = { id: number; name: string; email: string; allocationCents: number }
type Grant = { id: number; name: string; trail: string; region: string; meetingPoint: string; startsAt: string; budgetCents: number; status: string; visibility: "public" | "private"; isOrganiser: boolean; decisionReason: string | null; participants: Participant[] }
type PublicHike = { id: number; name: string; trail: string; region: string; meetingPoint: string; startsAt: string; organiser: string; participantCount: number }
const money = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n / 100)
const tone = (s: string): "neutral" | "ok" | "warn" | "bad" => ["approved", "paid", "completed"].includes(s) ? "ok" : s === "rejected" ? "bad" : s === "pending" ? "warn" : "neutral"

export default function Index({ grants, publicHikes }: { grants: Grant[]; publicHikes: PublicHike[] }) {
  const [tab, setTab] = useState<"explore" | "mine">("explore")
  const [fields, setFields] = useState({ name: "", trail: "", region: "", meeting_point: "", starts_at: "", budget: "", visibility: "public", participant_emails: "" })
  const [adding, setAdding] = useState<number | null>(null)
  const [emails, setEmails] = useState("")
  function change(key: keyof typeof fields, value: string) { setFields(old => ({ ...old, [key]: value })) }
  function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); router.post("/hike_grants", { hike_grant: fields, participant_emails: fields.participant_emails }) }
  function addPeople(id: number) { router.post(`/hike_grants/${id}/add_participants`, { participant_emails: emails }, { onSuccess: () => { setAdding(null); setEmails("") } }) }

  return <>
    <Head title="Hikes - Survive" />
    <main id="main" style={{ maxWidth: 1000, margin: "0 auto", padding: "var(--sp-5) var(--sp-4)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", alignItems: "center", flexWrap: "wrap" }}>
        <div><p className="u-label u-faint">Survive · Community</p><h1 className="u-h1">🥾 Hikes</h1><p className="u-sm u-soft">Find a hike or organise one with the community.</p></div>
        <Link className="btn btn--quiet" href="/dashboard">← Dashboard</Link>
      </header>

      <div role="tablist" aria-label="Hikes" style={{ display: "flex", gap: "var(--sp-2)", borderBottom: "1px solid var(--border)", marginTop: "var(--sp-4)" }}>
        <button type="button" role="tab" aria-selected={tab === "explore"} className={tab === "explore" ? "btn btn--primary" : "btn btn--quiet"} onClick={() => setTab("explore")}>Explore hikes</button>
        <button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "btn btn--primary" : "btn btn--quiet"} onClick={() => setTab("mine")}>My hikes</button>
      </div>

      {tab === "explore" ? <section style={{ marginTop: "var(--sp-4)" }}>
        <h2 className="u-h2">Upcoming community hikes</h2>
        <p className="u-sm u-soft">Approved hikes are visible to everyone. Organisers' participant lists and funding details stay private.</p>
        {publicHikes.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">No upcoming hikes have been approved yet. Check back soon, or organise the first one.</p><button className="btn btn--primary" type="button" onClick={() => setTab("mine")}>Organise a hike</button></div> : <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          {publicHikes.map(h => <article className="card" key={h.id} style={{ padding: "var(--sp-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}><div><h3 className="u-h3">{h.name}</h3><p className="u-sm u-soft">{h.trail} · {h.region}</p><p className="u-xs u-faint">{h.startsAt} · Meet at {h.meetingPoint}</p><p className="u-xs u-faint">Organised by {h.organiser}</p></div><div style={{ textAlign: "right" }}><Status tone="ok">Approved</Status><p className="u-xs u-faint" style={{ marginTop: 8 }}>{h.participantCount} {h.participantCount === 1 ? "hiker" : "hikers"}</p></div></div>
          </article>)}
        </div>}
      </section> : <section style={{ marginTop: "var(--sp-4)" }}>
        <h2 className="u-h2">Organise a hike</h2>
        <p className="u-sm u-soft">Submit a group hike for funding review, then add people while it's awaiting review.</p>
        <form className="card" onSubmit={submit} style={{ padding: "var(--sp-4)", marginTop: "var(--sp-3)", display: "grid", gap: "var(--sp-3)" }}>
          <h3 className="u-h3">Submit a hike</h3>
          <label className="field"><span className="field__label">Hike visibility</span><select className="field__input" value={fields.visibility} onChange={e => change("visibility",e.target.value)}><option value="public">Public — listed in Explore after approval</option><option value="private">Private — only visible to you and invited participants</option></select><span className="u-xs u-faint">You can’t change visibility after submitting.</span></label>
          <div className="form-grid">
            {([["name","Hike name","Blue Mountains day hike"],["trail","Trail","Grand Canyon Track"],["region","Region","Sydney, NSW"],["meeting_point","Public meeting point","Central Station, main concourse"]] as const).map(([key,label,placeholder]) => <label className="field" key={key}><span className="field__label">{label}</span><input className="field__input" required value={fields[key]} onChange={e => change(key,e.target.value)} placeholder={placeholder}/></label>)}
            <label className="field"><span className="field__label">Date and time</span><input className="field__input" type="datetime-local" required value={fields.starts_at} onChange={e => change("starts_at",e.target.value)}/></label>
            <label className="field"><span className="field__label">Total budget (AUD)</span><input className="field__input" type="number" min="0.01" step="0.01" required value={fields.budget} onChange={e => change("budget",e.target.value)}/></label>
          </div>
          <label className="field"><span className="field__label">Participant emails</span><textarea className="field__input" rows={3} required value={fields.participant_emails} onChange={e => change("participant_emails",e.target.value)} placeholder="one@hackclub.com, two@hackclub.com"/><span className="u-xs u-faint">Only registered Survive accounts. Separate emails with commas or new lines. The budget is split evenly.</span></label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn--primary" type="submit">Submit for review</button></div>
        </form>
        <h3 className="u-h2" style={{ marginTop: "var(--sp-5)" }}>Your submitted hikes</h3>
        {grants.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">You haven't submitted a hike yet.</p></div> : <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          {grants.map(g => <article className="card" key={g.id} style={{ padding: "var(--sp-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}><div><div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center", flexWrap: "wrap" }}><h3 className="u-h3">{g.name}</h3><Status tone={tone(g.status)}>{g.status}</Status><Status tone="neutral">{g.visibility === "private" ? "Private" : "Public"}</Status></div><p className="u-sm u-soft">{g.trail} · {g.region} · {g.startsAt}</p><p className="u-xs u-faint">Meet at {g.meetingPoint}</p></div><div><strong className="u-h3">{money(g.budgetCents)}</strong><p className="u-xs u-faint">{g.participants.length} hikers</p></div></div>
            {g.decisionReason && <p className="u-sm">Review note: {g.decisionReason}</p>}
            <div style={{ overflowX: "auto", marginTop: "var(--sp-3)" }}><table className="data-table"><thead><tr><th>Hiker</th><th>Budget share</th></tr></thead><tbody>{g.participants.map(p => <tr key={p.id}><td><strong>{p.name}</strong><div className="u-xs u-faint">{p.email}</div></td><td>{money(p.allocationCents)}</td></tr>)}</tbody></table></div>
            {g.isOrganiser && g.status === "pending" && <div style={{ marginTop: "var(--sp-3)" }}>{adding === g.id ? <div style={{ display: "grid", gap: "var(--sp-2)" }}><label className="field"><span className="field__label">Add participant emails</span><textarea className="field__input" rows={2} value={emails} onChange={e => setEmails(e.target.value)} placeholder="three@hackclub.com, four@hackclub.com"/></label><p className="u-xs u-faint">All participant shares will be recalculated evenly.</p><div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-2)" }}><button className="btn btn--quiet btn--sm" type="button" onClick={() => setAdding(null)}>Cancel</button><button className="btn btn--primary btn--sm" type="button" disabled={!emails.trim()} onClick={() => addPeople(g.id)}>Add people</button></div></div> : <button className="btn btn--quiet btn--sm" type="button" onClick={() => { setAdding(g.id); setEmails("") }}>＋ Add people to this hike</button>}</div>}
            {g.isOrganiser && g.status !== "pending" && <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>Participant changes close after review.</p>}
          </article>)}
        </div>}
      </section>}
    </main>
  </>
}
