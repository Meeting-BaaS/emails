/**
 * Represents a user in the system
 */
export type RawUser = {
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  firstname: string
  lastname: string | null
  /**
   * User status code as per Meeting BaaS accounts table
   * Status 4 represents a verified user, and is required for legacy services
   */
  status: number
  phone: string | null
  companyName: string | null
  companySize: string | null
  usagePlanned: string | null
  botsApiKey: string | null
  id: string
}

export type RawSession = {
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
  ipAddress: string
  userAgent: string
  userId: string
  id: string
}

/**
 * Represents an authenticated user session
 * Contains both session metadata and the associated user information
 */
export type RawSessionObject = {
  session: RawSession
  user: RawUser
}

export type User = RawUser & {
  id: number
}

export type Session = RawSession & {
  userId: number
}

export type SessionObject = {
  session: Session
  user: User
}
