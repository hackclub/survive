import { useState } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { Status } from "../../components/Status"
import { ImageCarousel } from "../../components/ImageCarousel"
import { AppShell } from "../../components/AppShell"

type Participant = { id: number; name: string; email: string; allocationCents: number }
type Wood = { woodNeeded: number; woodRaised: number; myWood: number }
type Item = { id: number; label: string; amountCents: number; reason: string }
type CostKind = { kind: string; label: string; hint: string }
type DraftItem = { kind: string; amount: string; reason: string }
type Grant = { id: number; name: string; trail: string; region: string; meetingPoint: string; startsAt: string; budgetCents: number; status: string; visibility: "public" | "private"; isOrganiser: boolean; decisionReason: string | null; items: Item[]; participants: Participant[]; contributors: { name: string; wood: number }[] } & Wood
type NeedsWood = { id: number; name: string; trail: string; region: string; startsAt: string; organiser: string; isOrganiser: boolean; items: { id: number; label: string; reason: string }[] } & Wood
type GallerySlide = { id: number; imageUrl: string; caption: string | null }
type PublicHike = { id: number; name: string; trail: string; region: string; meetingPoint: string; startsAt: string; organiser: string; participantCount: number }
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n / 100)
const tone = (s: string): "neutral" | "ok" | "warn" | "bad" => ["approved", "paid", "completed"].includes(s) ? "ok" : s === "rejected" ? "bad" : s === "pending" ? "warn" : "neutral"


function WoodBar({ hike }: { hike: Wood }) {
  const percent = hike.woodNeeded > 0 ? Math.min(100, Math.round((hike.woodRaised / hike.woodNeeded) * 100)) : 100
  return <div style={{ display: "grid", gap: 4 }}>
    <div style={{ display: "flex", justifyContent: "space-between" }} className="u-xs"><strong>{hike.woodRaised} / {hike.woodNeeded} wood</strong><span className="u-faint">{hike.woodRaised >= hike.woodNeeded ? "Fully paid" : `${hike.woodNeeded - hike.woodRaised} to go`}</span></div>
    <div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }} role="progressbar" aria-valuemin={0} aria-valuemax={hike.woodNeeded} aria-valuenow={hike.woodRaised}><div style={{ width: `${percent}%`, height: "100%", background: "var(--accent, #8a5a2b)" }} /></div>
  </div>
}

function ChipIn({ id, hike, spendable }: { id: number; hike: Wood; spendable: number }) {
  const left = Math.max(0, hike.woodNeeded - hike.woodRaised)
  const most = Math.min(left, spendable)
  const [wood, setWood] = useState("")
  const amount = parseInt(wood, 10) || 0
  function give() { router.post(`/hike_grants/${id}/contribute`, { wood: amount }, { preserveScroll: true, onSuccess: () => setWood("") }) }
  function takeBack() { if (confirm(`Take your ${hike.myWood} wood back out of this hike?`)) router.delete(`/hike_grants/${id}/contribute`, { preserveScroll: true }) }

  return <div style={{ display: "grid", gap: "var(--sp-2)" }}>
    <WoodBar hike={hike} />
    {left > 0 && (most > 0
      ? <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center", flexWrap: "wrap" }}>
          <input className="field__input" style={{ maxWidth: 120 }} type="number" min={1} max={most} step={1} value={wood} onChange={e => setWood(e.target.value)} placeholder="Wood" aria-label="Wood to put in" />
          <button className="btn btn--primary btn--sm" type="button" disabled={amount < 1 || amount > most} onClick={give}>Chip in</button>
          {most > 1 && <button className="btn btn--quiet btn--sm" type="button" onClick={() => setWood(String(most))}>{most === left ? "Pay the rest" : `All ${most} I have`}</button>}
        </div>
      : <p className="u-xs u-faint">You don't have any wood to put in right now.</p>)}
    {hike.myWood > 0 && <p className="u-xs u-faint">You've put in {hike.myWood} wood. <button className="btn btn--quiet btn--sm" type="button" onClick={takeBack}>Take it back</button></p>}
  </div>
}

export default function Index({ grants, publicHikes, needsWood, costKinds, woodRate, spendable, galleryImages = [] }: { galleryImages?: GallerySlide[]; grants: Grant[]; publicHikes: PublicHike[]; needsWood: NeedsWood[]; costKinds: CostKind[]; woodRate: number; spendable: number }) {
  const [tab, setTab] = useState<"explore" | "mine">("explore")
  const [fields, setFields] = useState({ name: "", trail: "", region: "", meeting_point: "", starts_at: "", visibility: "public", participant_emails: "" })
  const [items, setItems] = useState<DraftItem[]>([])
  const kindInfo = (kind: string) => costKinds.find(k => k.kind === kind)
  const totalCents = items.reduce((sum, item) => sum + Math.max(0, Math.round((parseFloat(item.amount) || 0) * 100)), 0)
  const woodNeeded = Math.ceil((totalCents * woodRate) / 100)
  const [upfront, setUpfront] = useState("")
  const upfrontWood = Math.max(0, parseInt(upfront, 10) || 0)
  const upfrontMax = Math.min(woodNeeded, spendable)
  function addItem(kind: string) { setItems(old => [...old, { kind, amount: "", reason: "" }]) }
  function changeItem(index: number, key: keyof DraftItem, value: string) { setItems(old => old.map((item, i) => i === index ? { ...item, [key]: value } : item)) }
  function removeItem(index: number) { setItems(old => old.filter((_, i) => i !== index)) }
  const [adding, setAdding] = useState<number | null>(null)
  const [emails, setEmails] = useState("")
  function change(key: keyof typeof fields, value: string) { setFields(old => ({ ...old, [key]: value })) }
  function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); router.post("/hike_grants", { hike_grant: fields, items, participant_emails: fields.participant_emails, wood: upfrontWood }) }
  function addPeople(id: number) { router.post(`/hike_grants/${id}/add_participants`, { participant_emails: emails }, { onSuccess: () => { setAdding(null); setEmails("") } }) }

  return <>
    <Head title="Hikes - Survive" />
    <AppShell
      title="Hikes"
      lede="Join a hike, plan one, or chip in wood to help someone else's happen."
      narrow
      actions={<Link className="btn btn--quiet btn--sm" href="/dashboard">← Dashboard</Link>}
    >

      {galleryImages.length > 0 && <div style={{ marginTop: "var(--sp-4)" }}><ImageCarousel images={galleryImages} label="Hikes gallery" /></div>}

      <div role="tablist" aria-label="Hikes" style={{ display: "flex", gap: "var(--sp-2)", borderBottom: "1px solid var(--border)", marginTop: "var(--sp-4)" }}>
        <button type="button" role="tab" aria-selected={tab === "explore"} className={tab === "explore" ? "btn btn--primary" : "btn btn--quiet"} onClick={() => setTab("explore")}>Upcoming</button>
        <button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "btn btn--primary" : "btn btn--quiet"} onClick={() => setTab("mine")}>Your hikes</button>
      </div>

      {tab === "explore" ? <section style={{ marginTop: "var(--sp-4)" }}>
        {needsWood.length > 0 && <div style={{ marginBottom: "var(--sp-5)" }}>
          <h2 className="u-h2">Needs wood</h2>
          <p className="u-sm u-soft">These hikes can't go ahead until their wood is paid. Anyone can chip in. If a hike doesn't get approved, you get your wood back.</p>
          <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
            {needsWood.map(h => <article className="card" key={h.id} style={{ padding: "var(--sp-4)", display: "grid", gap: "var(--sp-3)" }}>
              <div><h3 className="u-h3">{h.name}</h3><p className="u-sm u-soft">{h.trail} · {h.region}</p><p className="u-xs u-faint">{h.startsAt} · Organised by {h.organiser}{h.isOrganiser ? " (you)" : ""}</p></div>
              {h.items.length > 0 && <ul style={{ display: "grid", gap: "var(--sp-1)", paddingLeft: 0, listStyle: "none" }}>{h.items.map(item => <li key={item.id} className="u-sm"><strong>{item.label}</strong><div className="u-xs u-faint">{item.reason}</div></li>)}</ul>}
              <ChipIn id={h.id} hike={h} spendable={spendable} />
            </article>)}
          </div>
        </div>}
        <h2 className="u-h2">Upcoming hikes</h2>
        <p className="u-sm u-soft">Approved and paid for. Who's going and who paid stays between the organiser and us.</p>
        {publicHikes.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">Nothing planned yet. Want to plan the first one?</p><button className="btn btn--primary" type="button" onClick={() => setTab("mine")}>Plan a hike</button></div> : <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          {publicHikes.map(h => <article className="card" key={h.id} style={{ padding: "var(--sp-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}><div><h3 className="u-h3">{h.name}</h3><p className="u-sm u-soft">{h.trail} · {h.region}</p><p className="u-xs u-faint">{h.startsAt} · Meet at {h.meetingPoint}</p><p className="u-xs u-faint">Organised by {h.organiser}</p></div><div style={{ textAlign: "right" }}><Status tone="ok">Approved</Status><p className="u-xs u-faint" style={{ marginTop: 8 }}>{h.participantCount} {h.participantCount === 1 ? "hiker" : "hikers"}</p></div></div>
          </article>)}
        </div>}
      </section> : <section style={{ marginTop: "var(--sp-4)" }}>
        <h2 className="u-h2">Plan a hike</h2>
        <p className="u-sm u-soft">Tell us where you're going and what it'll cost. The hike is paid for in wood, and we can only approve it once all of it is in. You can keep adding people until we review it.</p>
        <form className="card" onSubmit={submit} style={{ padding: "var(--sp-4)", marginTop: "var(--sp-3)", display: "grid", gap: "var(--sp-3)" }}>
          <h3 className="u-h3">New hike</h3>
          <label className="field"><span className="field__label">Who can see it</span><select className="field__input" value={fields.visibility} onChange={e => change("visibility",e.target.value)}><option value="public">Everyone (anyone can chip in wood, and it shows in Upcoming once approved)</option><option value="private">Only you and the people you add</option></select><span className="u-xs u-faint">You can't change this later.</span></label>
          <div className="form-grid">
            {([["name","Name","Blue Mountains day hike"],["trail","Trail","Grand Canyon Track"],["region","Region","Sydney, NSW"],["meeting_point","Meeting point (somewhere public)","Central Station, main concourse"]] as const).map(([key,label,placeholder]) => <label className="field" key={key}><span className="field__label">{label}</span><input className="field__input" required value={fields[key]} onChange={e => change(key,e.target.value)} placeholder={placeholder}/></label>)}
            <label className="field"><span className="field__label">When</span><input className="field__input" type="datetime-local" required value={fields.starts_at} onChange={e => change("starts_at",e.target.value)}/></label>
          </div>
          <div className="field">
            <span className="field__label">What it costs (USD)</span>
            <span className="u-xs u-faint">Add each thing the hike needs and say why. Prices are rough guides, so put what it will really cost.</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", marginTop: "var(--sp-2)" }}>
              {costKinds.map(k => <button key={k.kind} type="button" className="btn btn--quiet btn--sm" onClick={() => addItem(k.kind)}>+ {k.label}</button>)}
            </div>
            {items.length > 0 && <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
              {items.map((item, index) => {
                const info = kindInfo(item.kind)
                return <div key={index} className="card" style={{ padding: "var(--sp-3)", display: "grid", gap: "var(--sp-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-2)", alignItems: "baseline", flexWrap: "wrap" }}>
                    <strong>{info?.label ?? item.kind}</strong>
                    <button type="button" className="btn btn--quiet btn--sm" onClick={() => removeItem(index)}>Remove</button>
                  </div>
                  <span className="u-xs u-faint">{info?.hint}</span>
                  <label className="field"><span className="field__label">Cost (USD)</span><input className="field__input" type="number" min="0.01" step="0.01" required value={item.amount} onChange={e => changeItem(index, "amount", e.target.value)} placeholder="15.00" /></label>
                  <label className="field"><span className="field__label">Why do you need it?</span><textarea className="field__input" rows={2} required minLength={10} value={item.reason} onChange={e => changeItem(index, "reason", e.target.value)} placeholder={item.kind === "fuel" ? "Sam is driving four of us 60 miles each way to the trailhead." : "What it's for and who it's for."} /></label>
                </div>
              })}
            </div>}
            <div className="card" style={{ padding: "var(--sp-3)", marginTop: "var(--sp-3)", display: "grid", gap: "var(--sp-1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total cost</span><strong>{money(totalCents)}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Wood this hike needs</span><strong>{woodNeeded} wood</strong></div>
              <label className="field" style={{ marginTop: "var(--sp-2)" }}><span className="field__label">Wood you put in now</span><input className="field__input" type="number" min={0} max={upfrontMax} step={1} value={upfront} onChange={e => setUpfront(e.target.value)} placeholder="0" disabled={woodNeeded === 0} /><span className="u-xs u-faint">You have {spendable} wood. Pay it all, some, or none. Whatever's left shows up under Needs wood (for public hikes) so anyone can chip in. Your wood is held while we review, spent if we approve, and handed back if we don't.</span></label>
              {upfrontWood > upfrontMax && <p className="u-xs" style={{ color: "var(--danger, #b42318)" }}>You can put in at most {upfrontMax} wood.</p>}
            </div>
          </div>
          <label className="field"><span className="field__label">Who's coming</span><textarea className="field__input" rows={3} required value={fields.participant_emails} onChange={e => change("participant_emails",e.target.value)} placeholder="one@hackclub.com, two@hackclub.com"/><span className="u-xs u-faint">Their Survive emails, including yours if you're going, separated by commas or new lines.</span></label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn--primary" type="submit" disabled={items.length === 0 || upfrontWood > upfrontMax}>Send for review</button></div>
        </form>
        <h3 className="u-h2" style={{ marginTop: "var(--sp-5)" }}>Your hikes</h3>
        {grants.length === 0 ? <div className="dashboard__empty"><p className="u-sm u-faint">You haven't planned a hike yet.</p></div> : <div style={{ display: "grid", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          {grants.map(g => <article className="card" key={g.id} style={{ padding: "var(--sp-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}><div><div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center", flexWrap: "wrap" }}><h3 className="u-h3">{g.name}</h3><Status tone={tone(g.status)}>{g.status}</Status><Status tone="neutral">{g.visibility === "private" ? "Private" : "Public"}</Status></div><p className="u-sm u-soft">{g.trail} · {g.region} · {g.startsAt}</p><p className="u-xs u-faint">Meet at {g.meetingPoint}</p></div><div><strong className="u-h3">{money(g.budgetCents)}</strong><p className="u-xs u-faint">{g.participants.length} {g.participants.length === 1 ? "hiker" : "hikers"}</p></div></div>
            {g.decisionReason && <p className="u-sm">From the reviewer: {g.decisionReason}</p>}
            {g.items.length > 0 && <ul style={{ marginTop: "var(--sp-3)", display: "grid", gap: "var(--sp-1)", paddingLeft: 0, listStyle: "none" }}>{g.items.map(item => <li key={item.id} className="u-sm"><strong>{item.label}</strong> · {money(item.amountCents)}<div className="u-xs u-faint">{item.reason}</div></li>)}</ul>}
            <div style={{ marginTop: "var(--sp-3)" }}>{g.status === "pending" ? <ChipIn id={g.id} hike={g} spendable={spendable} /> : <WoodBar hike={g} />}</div>
            {g.contributors.length > 0 && <p className="u-xs u-faint" style={{ marginTop: "var(--sp-2)" }}>Paid by {g.contributors.map(c => `${c.name} (${c.wood})`).join(", ")}</p>}
            <div style={{ overflowX: "auto", marginTop: "var(--sp-3)" }}><table className="data-table"><thead><tr><th>Hiker</th><th>Their share</th></tr></thead><tbody>{g.participants.map(p => <tr key={p.id}><td><strong>{p.name}</strong><div className="u-xs u-faint">{p.email}</div></td><td>{money(p.allocationCents)}</td></tr>)}</tbody></table></div>
            {g.isOrganiser && g.status === "pending" && <div style={{ marginTop: "var(--sp-3)" }}>{adding === g.id ? <div style={{ display: "grid", gap: "var(--sp-2)" }}><label className="field"><span className="field__label">More people</span><textarea className="field__input" rows={2} value={emails} onChange={e => setEmails(e.target.value)} placeholder="three@hackclub.com, four@hackclub.com"/></label><p className="u-xs u-faint">They'll be added to the hike. It doesn't change how much wood it needs.</p><div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-2)" }}><button className="btn btn--quiet btn--sm" type="button" onClick={() => setAdding(null)}>Cancel</button><button className="btn btn--primary btn--sm" type="button" disabled={!emails.trim()} onClick={() => addPeople(g.id)}>Add people</button></div></div> : <button className="btn btn--quiet btn--sm" type="button" onClick={() => { setAdding(g.id); setEmails("") }}>Add people</button>}</div>}
            {g.isOrganiser && g.status !== "pending" && <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>You can't change who's going once it's been reviewed.</p>}
          </article>)}
        </div>}
      </section>}
    </AppShell>
  </>
}
