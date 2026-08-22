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
  isAdmin: boolean
  isSuperadmin: boolean
  hackatimeConnected: boolean
}

export type SharedProps = {
  auth: {
    user: AuthUser | null
  }
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

export type ReviewState = "pending" | "in_review" | "approved" | "rejected" | "returned"

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
  claimedMinutes: number | null
  approvedMinutes: number | null
  reviewFeedback: string | null
}

export type HackatimeProject = {
  id: number
  name: string
  seconds: number
  linked?: boolean
}

export type Pagination = {
  page: number
  pages: number
  count: number
}

export type ProjectEventAction = "submitted" | "approved" | "rejected" | "returned"

export type ProjectEvent = {
  id: number
  action: ProjectEventAction
  feedback: string | null
  actorName: string
  createdAt: string
}

