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
  isAdmin: boolean
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

export type Project = {
  id: number
  name: string
  description: string | null
  status: ProjectStatus
  repoLink: string | null
  demoLink: string | null
  bannerUrl: string | null
  updatedAt: string
  reviewFeedback: string | null
}

export type HourVerdict = "approved" | "reduced" | "rejected"

export type ReviewHourEntry = {
  id: number
  name: string
  claimedSeconds: number
  approvedMinutes: number
  verdict: HourVerdict
  note: string | null
}

export type HackatimeProject = {
  id: number
  name: string
  seconds: number
  linked?: boolean
}

export type ReviewQueueEntry = {
  id: number
  round: number
  name: string
  ownerName: string
  repoLink: string | null
  demoLink: string | null
  bannerUrl: string | null
  submittedAt: string
  claimedByYou: boolean
  hackatimeSeconds: number
}

export type Pagination = {
  page: number
  pages: number
  count: number
}

export type ProjectEventAction = "submitted" | "approved" | "rejected"

export type ProjectEvent = {
  id: number
  action: ProjectEventAction
  feedback: string | null
  actorName: string
  createdAt: string
}

export type SubmitterHistory = {
  approvedCount: number
  rejectedCount: number
}

export type ReviewHistoryEntry = {
  id: number
  action: "approved" | "rejected"
  projectName: string
  createdAt: string
}
