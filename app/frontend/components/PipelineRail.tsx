import type { ReviewState } from "../types"

const STEPS = ["Submitted", "Reviewed", "Approved"] as const

type StepState = "done" | "now" | "todo"

const PROGRESS: Record<"pending" | "in_review" | "approved", StepState[]> = {
  pending: ["done", "now", "todo"],
  in_review: ["done", "now", "todo"],
  approved: ["done", "done", "done"],
}

export function railStates(state: ReviewState | null): StepState[] | null {
  if (state === null) return null
  if (state === "rejected" || state === "returned" || state === "withdrawn") return null
  return PROGRESS[state]
}

export function PipelineRail({ state, invert }: { state: ReviewState; invert?: boolean }) {
  const states = railStates(state)
  if (!states) return null

  return (
    <ol className={`rail${invert ? " rail--invert" : ""}`}>
      {STEPS.map((label, index) => (
        <li key={label} className={`rail__step rail__step--${states[index]}`}>
          <span className="rail__track">
            <span className="rail__dot" />
            {index < STEPS.length - 1 && <span className="rail__line" />}
          </span>
          <span className="rail__label">{label}</span>
        </li>
      ))}
    </ol>
  )
}
