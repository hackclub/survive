import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { Status } from "../../components/Status"

type Participant = { id: number; name: string; email: string; allocationCents: number }
type Grant = { id: number; name: string; trail: string; region: string; meetingPoint: string; startsAt: string; budgetCents: number; status: string; decisionReason: string | null; participants: Participant[] }
const money = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n / 100)
const tone = (s: string): "neutral" | "ok" | "warn" | "bad" => ["approved", "paid", "completed"].includes(s) ? "ok" : s === "rejected" ? "bad" : s === "pending" ? "warn" : "neutral"

export default function Index({ grants }: { grants: Grant[] }) {
  const [fields, setFields] = useState({ name: "", trail: "", region: "", meeting_point: "", starts_at: "", budget: "", participant_emails: "" })
  const [adding, setAdding] = useState<number | null>(null)
  const [emails, setEmails] = useState("")
  function change(key: keyof typeof fields, value: string) { setFields(old => ({ ...old, [key]: value })) }
  function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); router.post("/hike_grants", { hike_grant: fields, participant_emails: fields.participant_emails }) }
  function addPeople(id: number) { router.post(`/hike_grants/${id}/add_participants`, { participant_emails: emails }, { onSuccess: () => { setAdding(null); setEmails("") } }) }

  return <>
    <Head title="Organise a hike - Survive" />
    <main id="main" style={{ maxWidth: 1000, margin: "0 auto", padding: "var(--sp-5) var(--sp-4)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", alignItems: "center", flexWrap: "wrap" }}>
        <div><p className="u-label u-faint">Survive · Community</p><h1 className="u-h1">🥾 Organise a hike</h1><p className="u-sm u-soft">Submit a hike for funding review, then manage your group.</p></div>
        <Link className="btn btn--quiet" href="/dashboard">← Dashboard</Link>
      </header>
      <form className="card" onSubmit={submit} style={{ padding: "var(--sp-4)", marginTop: "var(--sp-4)", display: "grid", gap: "var(--sp-3)" }}>
        <h2 className="u-h3">Submit a hike</h2>
        <div className="form-grid">
          {([["name","Hike name","Blue Mountains day hike"],["trail","Trail","Grand Canyon Track"],["region","Region","Sydney, NSW"],["meeting_point","Public meeting point","Central Station, main concourse"]] as const).map(([key,label,placeholder]) => <label className="field" key={key}><span className="field__label">{label}</span><input className="field__input" required value={fields[key]} onChange={e => change(key,e.target.value)} placeholder={placeholder}/></label>)}
          <label className="field"><span className="field__label">Date and time</span><input className="field__input" type="datetime-local" required value={fields.starts_at} onChange={e => change("starts_at",e.target.value)}/></label>
          <label className="field"><span className="field__label">Total budget (AUD)</span><input className="field__input" type="number" min="0.01" step="0.01" required value={fields.budget} onChange={e => change("budget",e.target.value)}/></label>
        </div>
        <label className="field"><span className="field__label">Participant emails</span><textarea className="field__input" rows={3} required value={fields.participant_emails} onChange={e => change("participant_emails",e.target.value)} placeholder="one@hackclub.com, two@hackclub.com"/><span className="u-xs u-faint">Only registered Survive accounts. Separate emails with commas or new lines. The budget is split evenly.</span></label>
        <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn--primary" type="submit">Submit for review</button></div>
      </form>
      <section style={{ marginTop: "var(--sp-5)" }}><h2 className="u-h2">Your submitted hikes</h2>
        {grants.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">You haven't submitted a hike yet.</p></div> : <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          {grants.map(g => <article className="card" key={g.id} style={{ padding: "var(--sp-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}><div><div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center", flexWrap: "wrap" }}><h3 className="u-h3">{g.name}</h3><Status tone={tone(g.status)}>{g.status}</Status></div><p className="u-sm u-soft">{g.trail} · {g.region} · {g.startsAt}</p><p className="u-xs u-faint">Meet at {g.meetingPoint}</p></div><div><strong className="u-h3">{money(g.budgetCents)}</strong><p className="u-xs u-faint">{g.participants.length} hikers</p></div></div>
            {g.decisionReason && <p className="u-sm">Review note: {g.decisionReason}</p>}
            <div style={{ overflowX: "auto", marginTop: "var(--sp-3)" }}><table className="data-table"><thead><tr><th>Hiker</th><th>Budget share</th></tr></thead><tbody>{g.participants.map(p => <tr key={p.id}><td><strong>{p.name}</strong><div className="u-xs u-faint">{p.email}</div></td><td>{money(p.allocationCents)}</td></tr>)}</tbody></table></div>
            {g.status === "pending" && <div style={{ marginTop: "var(--sp-3)" }}>{adding === g.id ? <div style={{ display: "grid", gap: "var(--sp-2)" }}><label className="field"><span className="field__label">Add participant emails</span><textarea className="field__input" rows={2} value={emails} onChange={e => setEmails(e.target.value)} placeholder="three@hackclub.com, four@hackclub.com"/></label><p className="u-xs u-faint">All participant shares will be recalculated evenly.</p><div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-2)" }}><button className="btn btn--quiet btn--sm" type="button" onClick={() => setAdding(null)}>Cancel</button><button className="btn btn--primary btn--sm" type="button" disabled={!emails.trim()} onClick={() => addPeople(g.id)}>Add people</button></div></div> : <button className="btn btn--quiet btn--sm" type="button" onClick={() => { setAdding(g.id); setEmails("") }}>＋ Add people to this hike</button>}</div>}
            {g.status !== "pending" && <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>Participant changes close after review.</p>}
          </article>)}
        </div>}
      </section>
    </main>
  </>
}
