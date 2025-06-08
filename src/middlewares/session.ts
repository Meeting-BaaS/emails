import type { Context, Next } from "hono"
import { getEnvValue } from "../lib/utils"
import type { RawSessionObject, SessionObject } from "../types/session"
import { logger } from "../lib/logger"
import { UNKNOWN_ERROR } from "../lib/constants"

/**
 * Gets the authenticated user session from the auth service
 * @param c - The Hono context
 * @param next - The next middleware function
 * @returns The authenticated user session attached to the context
 */
export const getAuthSession = async (c: Context, next: Next) => {
  const AUTH_APP_URL = getEnvValue("NEXT_PUBLIC_AUTH_APP_URL")

  try {
    // Get all cookies from the request
    const cookies = c.req.raw.headers.get("cookie")

    // Make request to auth service
    const response = await fetch(`${AUTH_APP_URL}/api/auth/get-session`, {
      credentials: "include",
      headers: {
        cookie: cookies || ""
      }
    })

    if (!response.ok) {
      logger.debug(
        `Auth app fetch failed: ${response.status} ${response.statusText} ${response.url}. Cookies: ${cookies}`
      )
      throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`)
    }

    const rawSession = (await response.json()) as RawSessionObject

    if (!rawSession?.session) {
      logger.debug(`No session found. Cookies: ${cookies}`)
      return c.json({ error: "Unauthorized" }, 401)
    }

    const session = {
      ...rawSession,
      session: {
        ...rawSession.session,
        userId: Number(rawSession.session.userId)
      },
      user: {
        ...rawSession.user,
        id: Number(rawSession.user.id)
      }
    } as SessionObject

    // Add user to context for use in routes
    logger.debug(`Setting user: ${session.user.id}`)
    c.set("user", session.user)

    await next()
  } catch (error) {
    logger.error(`Auth session error: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`)
    return c.json({ error: "Internal Server Error" }, 500)
  }
}
