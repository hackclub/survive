export type FlashData = {
  notice?: string
  alert?: string
}

export type AuthUser = {
  id: number
  displayName: string
  email: string
  avatar: string | null
  isReviewer: boolean
  isFraud: boolean
  isFulfiller: boolean
  isAdmin: boolean
  isSuperadmin: boolean
  hackatimeConnected: boolean
  ordersChanged: boolean
  coins: {
    earned: number
    adjusted: number
    held: number
    heldOrders: number
    spendable: number
  }
}

export type SharedProps = {
  auth: {
    user: AuthUser | null
  }
  flash: FlashData
  signInPath: string
  signOutPath: string
  errors: Record<string, string[]>
}

export type ProjectStatus = "draft" | "pending" | "approved" | "rejected" | "returned"

export type CheckVerdict = "pass" | "fail" | "uncertain" | "skipped"

export type CheckResult = {
  key: string
  name: string
  source: string
  verdict: CheckVerdict
  reasoning: string
  blocking: boolean
}

export type ChecksResult = {
  overall: CheckVerdict
  blocking: CheckResult[]
  requirements: CheckResult[]
  checked_at: string
  engine: string
}

export type ReviewState = "pending" | "in_review" | "approved" | "rejected" | "returned" | "withdrawn"

export type Project = {
  id: number
  name: string
  description: string | null
  status: ProjectStatus
  repoLink: string | null
  demoLink: string | null
  bannerUrl: string | null
  updatedAt: string
  round: number | null
  reviewState: ReviewState | null
  approvedMinutes: number | null
  reviewFeedback: string | null
  trailStage: TrailStage
  trailNote: string | null
  paidCoins: number | null
}

export type TrailStage = "draft" | "sent" | "approved" | "changes" | "rejected"

export type HackatimeProject = {
  id: number
  name: string
  seconds: number
  linked?: boolean
}

export type AriPhase =
  | "processing"
  | "review"
  | "under_review"
  | "second_pass"
  | "reviewed"
  | "withdrawn"
  | "reverted"

export type SubmissionRow = {
  id: number
  projectId: number
  projectName: string
  makerName: string
  round: number
  state: ReviewState
  ariShipId: string | null
  ariPhase: AriPhase | null
  ariDecision: string | null
  approvedMinutes: number | null
  ingestVersion: number
  ingestedAt: string | null
  ingestError: string | null
  canWithdraw: boolean
  stuck: boolean
}

export type FilterTab = {
  key: string
  label: string
  count: number
}

export type FinalReviewStatus = "pending" | "passed" | "deducted" | "banned" | "voided"

export type FinalReviewRow = {
  id: number
  projectId: number
  projectName: string
  makerName: string
  round: number
  status: FinalReviewStatus
  approvedMinutes: number | null
  netMinutes: number
  flags: string[]
  claimedByYou: boolean
  heldByOther: boolean
  waitingSince: string
}

export type FinalReviewDetail = FinalReviewRow & {
  repoLink: string | null
  demoLink: string | null
  ariShipId: string | null
  ariAuditNote: string | null
  ariNoteToMaker: string | null
  ariReviewer: string | null
  minutesBreakdown: Record<string, number>
  signals: Record<string, unknown>
  decisionNote: string | null
  deductionMinutes: number | null
  maker: {
    name: string
    email: string
    banned: boolean
    approvedProjects: number
    rejectedProjects: number
    priorDeductions: number
  }
}

export type Pagination = {
  page: number
  pages: number
  count: number
}

export type ProjectEventAction = "submitted" | "approved" | "rejected" | "returned" | "reverted"

export type ProjectEvent = {
  id: number
  action: ProjectEventAction
  feedback: string | null
  actorName: string
  createdAt: string
}

