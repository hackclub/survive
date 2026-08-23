import { Scout } from "./Scout"

export type TrailStage = "draft" | "sent" | "approved" | "changes" | "rejected"

const OUTCOME: Record<string, string> = {
  draft: "Decided",
  sent: "Decided",
  approved: "Approved",
  changes: "Changes requested",
  rejected: "Rejected",
}

const CENTRES = [20.7, 50, 79.3]
const FILLS = [16.7, 50, 83.3]

export function Trail({ stage, note }: { stage: TrailStage; note?: string }) {
  const decided = stage === "approved" || stage === "changes" || stage === "rejected"
  const index = stage === "draft" ? 0 : stage === "sent" ? 1 : 2

  const modifier =
    stage === "approved" ? " ptrail--done" : stage === "changes" || stage === "rejected" ? " ptrail--back" : ""

  const stops = ["Drafted", "Sent for review", OUTCOME[stage]]

  return (
    <div className={`ptrail${modifier}`}>
      <div className="ptrail__line">
        <b className="ptrail__fill" style={{ width: `${FILLS[index]}%` }} />
      </div>

      <Scout className="ptrail__scout" style={{ insetInlineStart: `calc(${CENTRES[index]}% - 44px)` }} />

      <div className="ptrail__stops">
        {stops.map((label, position) => {
          const state =
            position < index || (decided && position <= index)
              ? " is-done"
              : position === index
                ? " is-now"
                : ""

          return (
            <div key={label} className={`ptrail__stop${state}`}>
              <span className="ptrail__pin" />
              <small className="ptrail__label">{label}</small>
            </div>
          )
        })}
      </div>

      {note && <p className="u-sm u-soft ptrail__note">{note}</p>}
    </div>
  )
}
