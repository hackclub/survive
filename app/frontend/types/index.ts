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
