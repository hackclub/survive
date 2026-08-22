import type { ReactNode } from "react"
import type { ProjectStatus, ReviewState } from "../types"

export type Tone = "neutral" | "ok" | "warn" | "bad" | "info"

const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  pending: { label: "In review", tone: "warn" },
  approved: { label: "Approved", tone: "ok" },
  rejected: { label: "Rejected", tone: "bad" },
  returned: { label: "Returned", tone: "warn" },
}

const REVIEW_STATE: Record<ReviewState, { label: string; tone: Tone }> = {
  pending: { label: "Waiting", tone: "warn" },
  in_review: { label: "In review", tone: "warn" },
  approved: { label: "Approved", tone: "ok" },
  rejected: { label: "Rejected", tone: "bad" },
  returned: { label: "Returned", tone: "warn" },
}

function classes(base: string, tone: Tone, invert?: boolean) {
  const parts = [base]
  if (tone !== "neutral") parts.push(`${base}--${tone}`)
  if (invert) parts.push(`${base}--invert`)
  return parts.join(" ")
}

export function projectStatusLabel(status: ProjectStatus) {
  return PROJECT_STATUS[status].label
}

export function Status({
  tone = "neutral",
  invert,
  children,
}: {
  tone?: Tone
  invert?: boolean
  children: ReactNode
}) {
  return <span className={classes("status", tone, invert)}>{children}</span>
}

export function Tag({
  tone = "neutral",
  invert,
  mono,
  children,
}: {
  tone?: Tone
  invert?: boolean
  mono?: boolean
  children: ReactNode
}) {
  return (
    <span className={`${classes("tag", tone, invert)}${mono ? " tag--mono" : ""}`}>{children}</span>
  )
}

export function ProjectStatusBadge({
  status,
  invert,
}: {
  status: ProjectStatus
  invert?: boolean
}) {
  const { label, tone } = PROJECT_STATUS[status]
  return (
    <Status tone={tone} invert={invert}>
      {label}
    </Status>
  )
}

export function ReviewStateBadge({ state, invert }: { state: ReviewState; invert?: boolean }) {
  const { label, tone } = REVIEW_STATE[state]
  return (
    <Status tone={tone} invert={invert}>
      {label}
    </Status>
  )
}
