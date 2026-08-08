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
}

export type SharedProps = {
  auth: {
    user: AuthUser | null
  }
  signInPath: string
  signOutPath: string
}

export type ProjectStatus = "draft" | "pending" | "approved" | "rejected"

export type Project = {
  id: number
  name: string
  status: ProjectStatus
  repoLink: string | null
  demoLink: string | null
  updatedAt: string
}
