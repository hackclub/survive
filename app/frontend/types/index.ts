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

export type ProjectStatus = "draft" | "pending" | "approved" | "rejected"

export type Project = {
  id: number
  name: string
  description: string | null
  status: ProjectStatus
  repoLink: string | null
  demoLink: string | null
  updatedAt: string
  reviewFeedback: string | null
}

export type HackatimeProject = {
  id: number
  name: string
  seconds: number
  linked?: boolean
}

export type ReviewQueueEntry = {
  id: number
  name: string
  ownerName: string
  repoLink: string | null
  demoLink: string | null
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
