import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { AdminSidebarLayout } from "../../../components/AdminSidebarLayout"
import { Status } from "../../../components/Status"

type Participant = {
  id: number
  userId: number
  name: string
  email: string
  allocationCents: number
  status: string
  hcbGrantId: string | null
  hcbGrantUrl: string | null
  issuedAt: string | null
}

type Grant = {
  id: number
  name: string
  trail: string
  region: string
  meetingPoint: string
  startsAt: string
  budgetCents: number
  allocatedCents: number
  status: string
  notes: string | null
  decisionReason: string | null
  createdBy: string
  reviewedBy: string | null
  participants: Participant[]
}

const money = (cents: number) => new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
}).format(cents / 100)

const tone = (status: string): "neutral" | "ok" | "warn" | "bad" => {
  if (status === "approved" || status === "paid" || status === "completed" || status === "issued") return "ok"
  if (status === "rejected" || status === "cancelled") return "bad"
  if (status === "pending" || status === "allocated") return "warn"
  return "neutral"
}

export default function Index({ grants, stats }: {
  grants: Grant[]
  stats: { total: number; pending: number; approved: number; allocatedCents: number }
}) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [trail, setTrail] = useState("")
  const [region, setRegion] = useState("")
  const [meetingPoint, setMeetingPoint] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [budget, setBudget] = useState("")
  const [participantEmails, setParticipantEmails] = useState("")
  const [rejecting, setRejecting] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [issuing, setIssuing] = useState<number | null>(null)
  const [hcbId, setHcbId] = useState("")
  const [hcbUrl, setHcbUrl] = useState("")

  function createGrant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.post("/admin/hike_grants", {
      hike_grant: { name, trail, region, meeting_point: meetingPoint, starts_at: startsAt, budget },
      participant_emails: participantEmails,
    }, {
      onSuccess: () => {
        setShowForm(false)
        setName("")
        setTrail("")
        setRegion("")
        setMeetingPoint("")
        setStartsAt("")
        setBudget("")
        setParticipantEmails("")
      },
    })
  }

  function decide(id: number, decision: "approve" | "reject") {
    router.post(`/admin/hike_grants/${id}/decide`, { decision, reason }, {
      onSuccess: () => {
        setRejecting(null)
        setReason("")
      },
    })
  }

  function recordIssue(grantId: number, participantId: number) {
    router.post(`/admin/hike_grants/${grantId}/participants/${participantId}/issue`, {
      hcb_grant_id: hcbId,
      hcb_grant_url: hcbUrl,
    }, {
      onSuccess: () => {
        setIssuing(null)
        setHcbId("")
        setHcbUrl("")
      },
    })
  }

  return (
    <>
      <Head title="Hike Grants - Admin - Survive" />
      <AdminSidebarLayout eyebrow="Admin · Funding" title="Hike Grants">
        <div style={{ maxWidth: 1100 }}>
          <div className="mystats__grid" style={{ marginBottom: "var(--sp-4)" }}>
            <div className="mystats__tile"><span className="mystats__number">{stats.total}</span><span className="u-xs u-faint">Total hikes</span></div>
            <div className="mystats__tile"><span className="mystats__number">{stats.pending}</span><span className="u-xs u-faint">Awaiting review</span></div>
            <div className="mystats__tile"><span className="mystats__number">{stats.approved}</span><span className="u-xs u-faint">Approved</span></div>
            <div className="mystats__tile"><span className="mystats__number">{money(stats.allocatedCents)}</span><span className="u-xs u-faint">Allocated to hikers</span></div>
          </div>

          <div className="card" style={{ padding: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--sp-3)", flexWrap: "wrap" }}>
              <div>
                <p className="u-label u-faint">Internal admin tool</p>
                <p className="u-sm u-soft">Create a hike grant, split its budget between registered participants, review it, then record each individual HCB card grant.</p>
              </div>
              <button className="btn btn--primary" type="button" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close form" : "＋ New hike grant"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={createGrant} style={{ marginTop: "var(--sp-4)", display: "grid", gap: "var(--sp-3)" }}>
                <div className="form-grid">
                  <label className="field"><span className="field__label">Hike name</span><input className="field__input" required value={name} onChange={e => setName(e.target.value)} placeholder="Blue Mountains day hike" /></label>
                  <label className="field"><span className="field__label">Trail</span><input className="field__input" required value={trail} onChange={e => setTrail(e.target.value)} placeholder="Grand Canyon Track" /></label>
                  <label className="field"><span className="field__label">Region</span><input className="field__input" required value={region} onChange={e => setRegion(e.target.value)} placeholder="Sydney, NSW" /></label>
                  <label className="field"><span className="field__label">Public meeting point</span><input className="field__input" required value={meetingPoint} onChange={e => setMeetingPoint(e.target.value)} placeholder="Central Station, main concourse" /></label>
                  <label className="field"><span className="field__label">Date and time</span><input className="field__input" type="datetime-local" required value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label>
                  <label className="field"><span className="field__label">Total budget (AUD)</span><input className="field__input" type="number" min="0.01" step="0.01" required value={budget} onChange={e => setBudget(e.target.value)} placeholder="200.00" /></label>
                </div>
                <label className="field">
                  <span className="field__label">Participant emails</span>
                  <textarea className="field__input" rows={3} required value={participantEmails} onChange={e => setParticipantEmails(e.target.value)} placeholder="one@hackclub.com, two@hackclub.com" />
                  <span className="u-xs u-faint">Only existing Survive accounts are accepted. Separate emails with commas or new lines. The budget is split evenly, including leftover cents.</span>
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-2)" }}>
                  <button className="btn btn--quiet" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="btn btn--primary" type="submit">Create and submit for review</button>
                </div>
              </form>
            )}
          </div>

          {grants.length === 0 ? (
            <div className="dashboard__empty"><p className="u-lead">No hike grants yet.</p><p className="u-sm u-faint">Create the first one to start managing group funding.</p></div>
          ) : (
            <div style={{ display: "grid", gap: "var(--sp-3)" }}>
              {grants.map(grant => (
                <section className="card" key={grant.id} style={{ padding: "var(--sp-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--sp-3)", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", flexWrap: "wrap" }}>
                        <h2 className="u-h3">{grant.name}</h2>
                        <Status tone={tone(grant.status)}>{grant.status}</Status>
                      </div>
                      <p className="u-sm u-soft" style={{ marginTop: "var(--sp-1)" }}>{grant.trail} · {grant.region} · {grant.startsAt}</p>
                      <p className="u-xs u-faint">Meet at {grant.meetingPoint} · Created by {grant.createdBy}{grant.reviewedBy ? ` · Reviewed by ${grant.reviewedBy}` : ""}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="u-h3">{money(grant.budgetCents)}</p>
                      <p className="u-xs u-faint">{grant.participants.length} hikers · {money(grant.allocatedCents)} allocated</p>
                    </div>
                  </div>

                  {grant.decisionReason && <p className="u-sm" style={{ marginTop: "var(--sp-2)" }}>Reason: {grant.decisionReason}</p>}

                  <div style={{ marginTop: "var(--sp-3)", overflowX: "auto" }}>
                    <table className="data-table">
                      <thead><tr><th>Participant</th><th>Individual share</th><th>Status</th><th>HCB reference</th><th></th></tr></thead>
                      <tbody>
                        {grant.participants.map(participant => (
                          <tr key={participant.id}>
                            <td><strong>{participant.name}</strong><div className="u-xs u-faint">{participant.email}</div></td>
                            <td className="u-mono">{money(participant.allocationCents)}</td>
                            <td><Status tone={tone(participant.status)}>{participant.status}</Status></td>
                            <td className="u-xs u-faint">{participant.hcbGrantUrl ? <a href={participant.hcbGrantUrl} target="_blank" rel="noreferrer">{participant.hcbGrantId || "Open HCB grant"}</a> : participant.hcbGrantId || "—"}</td>
                            <td>
                              {(grant.status === "approved" || grant.status === "paid") && participant.status !== "issued" && (
                                <button className="btn btn--quiet btn--sm" type="button" onClick={() => { setIssuing(participant.id); setHcbId(""); setHcbUrl("") }}>Record HCB grant</button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {issuing && grant.participants.some(p => p.id === issuing) && (
                          <tr><td colSpan={5}>
                            <div style={{ display: "grid", gap: "var(--sp-2)" }}>
                              <p className="u-sm">After creating this participant's card grant in HCB, record its reference here.</p>
                              <input className="field__input" value={hcbId} onChange={e => setHcbId(e.target.value)} placeholder="HCB card grant ID / reference" />
                              <input className="field__input" value={hcbUrl} onChange={e => setHcbUrl(e.target.value)} placeholder="HCB grant URL (optional)" />
                              <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                                <button className="btn btn--primary btn--sm" type="button" disabled={!hcbId.trim()} onClick={() => recordIssue(grant.id, issuing)}>Save issued grant</button>
                                <button className="btn btn--quiet btn--sm" type="button" onClick={() => setIssuing(null)}>Cancel</button>
                              </div>
                            </div>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {grant.status === "pending" && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-2)", marginTop: "var(--sp-3)" }}>
                      {rejecting === grant.id ? (
                        <div style={{ display: "flex", gap: "var(--sp-2)", flex: 1 }}>
                          <input className="field__input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection" />
                          <button className="btn btn--danger btn--sm" type="button" disabled={!reason.trim()} onClick={() => decide(grant.id, "reject")}>Confirm reject</button>
                          <button className="btn btn--quiet btn--sm" type="button" onClick={() => { setRejecting(null); setReason("") }}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn btn--quiet btn--sm" type="button" onClick={() => setRejecting(grant.id)}>Reject</button>
                          <button className="btn btn--primary btn--sm" type="button" onClick={() => decide(grant.id, "approve")}>Approve allocations</button>
                        </>
                      )}
                    </div>
                  )}
                  {grant.status === "approved" && (
                    <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>Approved. Create one separate HCB card grant for each participant using the individual amounts above, then record each reference. The dashboard does not issue money automatically.</p>
                  )}
                  {grant.status === "paid" && <p className="u-xs u-faint" style={{ marginTop: "var(--sp-3)" }}>Every participant's HCB grant has been recorded.</p>}
                </section>
              ))}
            </div>
          )}
        </div>
      </AdminSidebarLayout>
    </>
  )
}
