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
        <div><p className="u-label u-faint">Survive</p><h1 className="u-h1">Hikes</h1><p className="u-sm u-soft">Join a hike, or plan one and we'll help cover the cost.</p></div>
        <Link className="btn btn--quiet" href="/dashboard">← Dashboard</Link>
      </header>

      <div role="tablist" aria-label="Hikes" style={{ display: "flex", gap: "var(--sp-2)", borderBottom: "1px solid var(--border)", marginTop: "var(--sp-4)" }}>
        <button type="button" role="tab" aria-selected={tab === "explore"} className={tab === "explore" ? "btn btn--primary" : "btn btn--quiet"} onClick={() => setTab("explore")}>Upcoming</button>
        <button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "btn btn--primary" : "btn btn--quiet"} onClick={() => setTab("mine")}>Your hikes</button>
      </div>

      {tab === "explore" ? <section style={{ marginTop: "var(--sp-4)" }}>
        <h2 className="u-h2">Upcoming hikes</h2>
        <p className="u-sm u-soft">Anyone on Survive can see these. Who's going and how much each hike got stays between the organiser and us.</p>
        {publicHikes.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">Nothing planned yet. Want to plan the first one?</p><button className="btn btn--primary" type="button" onClick={() => setTab("mine")}>Plan a hike</button></div> : <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          {publicHikes.map(h => <article className="card" key={h.id} style={{ padding: "var(--sp-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}><div><h3 className="u-h3">{h.name}</h3><p className="u-sm u-soft">{h.trail} · {h.region}</p><p className="u-xs u-faint">{h.startsAt} · Meet at {h.meetingPoint}</p><p className="u-xs u-faint">Organised by {h.organiser}</p></div><div style={{ textAlign: "right" }}><Status tone="ok">Approved</Status><p className="u-xs u-faint" style={{ marginTop: 8 }}>{h.participantCount} {h.participantCount === 1 ? "hiker" : "hikers"}</p></div></div>
          </article>)}
        </div>}
      </section> : <section style={{ marginTop: "var(--sp-4)" }}>
        <h2 className="u-h2">Plan a hike</h2>
        <p className="u-sm u-soft">Tell us where you're going and what it'll cost, and we'll review it. You can keep adding people until we do.</p>
        <form className="card" onSubmit={submit} style={{ padding: "var(--sp-4)", marginTop: "var(--sp-3)", display: "grid", gap: "var(--sp-3)" }}>
          <h3 className="u-h3">New hike</h3>
          <label className="field"><span className="field__label">Who can see it</span><select className="field__input" value={fields.visibility} onChange={e => change("visibility",e.target.value)}><option value="public">Everyone (shows in Upcoming once approved)</option><option value="private">Only you and the people you add</option></select><span className="u-xs u-faint">You can't change this later.</span></label>
          <div className="form-grid">
            {([["name","Name","Blue Mountains day hike"],["trail","Trail","Grand Canyon Track"],["region","Region","Sydney, NSW"],["meeting_point","Meeting point (somewhere public)","Central Station, main concourse"]] as const).map(([key,label,placeholder]) => <label className="field" key={key}><span className="field__label">{label}</span><input className="field__input" required value={fields[key]} onChange={e => change(key,e.target.value)} placeholder={placeholder}/></label>)}
            <label className="field"><span className="field__label">When</span><input className="field__input" type="datetime-local" required value={fields.starts_at} onChange={e => change("starts_at",e.target.value)}/></label>
            <label className="field"><span className="field__label">How much you need (AUD)</span><input className="field__input" type="number" min="0.01" step="0.01" required value={fields.budget} onChange={e => change("budget",e.target.value)}/></label>
          </div>
          <label className="field"><span className="field__label">Who's coming</span><textarea className="field__input" rows={3} required value={fields.participant_emails} onChange={e => change("participant_emails",e.target.value)} placeholder="one@hackclub.com, two@hackclub.com"/><span className="u-xs u-faint">Their Survive emails, separated by commas or new lines. The money is split evenly between everyone.</span></label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn--primary" type="submit">Send for review</button></div>
        </form>
        <h3 className="u-h2" style={{ marginTop: "var(--sp-5)" }}>Your hikes</h3>
        {grants.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">You haven't planned a hike yet.</p></div> : <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          {grants.map(g => <article className="card" key={g.id} style={{ padding: "var(--sp-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}><div><div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center", flexWrap: "wrap" }}><h3 className="u-h3">{g.name}</h3><Status tone={tone(g.status)}>{g.status}</Status><Status tone="neutral">{g.visibility === "private" ? "Private" : "Public"}</Status></div><p className="u-sm u-soft">{g.trail} · {g.region} · {g.startsAt}</p><p className="u-xs u-faint">Meet at {g.meetingPoint}</p></div><div><strong className="u-h3">{money(g.budgetCents)}</strong><p className="u-xs u-faint">{g.participants.length} {g.participants.length === 1 ? "hiker" : "hikers"}</p></div></div>
            {g.decisionReason && <p className="u-sm">From the reviewer: {g.decisionReason}</p>}
            <div style={{ overflowX: "auto", marginTop: "var(--sp-3)" }}><table className="data-table"><thead><tr><th>Hiker</th><th>Their share</th></tr></thead><tbody>{g.participants.map(p => <tr key={p.id}><td><strong>{p.name}</strong><div className="u-xs u-faint">{p.email}</div></td><td>{money(p.allocationCents)}</td></tr>)}</tbody></table></div>
            {g.isOrganiser && g.status === "pending" && <div style={{ marginTop: "var(--sp-3)" }}>{adding === g.id ? <div style={{ display: "grid", gap: "var(--sp-2)" }}><label className="field"><span className="field__label">More people</span><textarea className="field__input" rows={2} value={emails} onChange={e => setEmails(e.target.value)} placeholder="three@hackclub.com, four@hackclub.com"/></label><p className="u-xs u-faint">The money gets split evenly again, including them.</p><div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-2)" }}><button className="btn btn--quiet btn--sm" type="button" onClick={() => setAdding(null)}>Cancel</button><button className="btn btn--primary btn--sm" type="button" disabled={!emails.trim()} onClick={() => addPeople(g.id)}>Add people</button></div></div> : <button className="btn btn--quiet btn--sm" type="button" onClick={() => { setAdding(g.id); setEmails("") }}>Add people</button>}</div>}
            {g.isOrganiser && g.status !== "pending" && <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>You can't change who's going once it's been reviewed.</p>}
          </article>)}
        </div>}
      </section>}
    </main>
  </>
}
