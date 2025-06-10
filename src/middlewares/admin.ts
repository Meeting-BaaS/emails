import type { Next } from "hono"
import { logger } from "../lib/logger"
import type { AppContext } from "../types/context"

/**
 * Middleware to check if the user is an admin based on their email suffix
 * @param c - The Hono context
 * @param next - The next middleware function
 */
export const adminMiddleware = async (c: AppContext, next: Next) => {
  const user = c.get("user")
  const email = user.email
  const domain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "meetingbaas.com"

  logger.debug(`Checking admin access for email: ${email}`)

  if (!email || !email.endsWith(`@${domain}`)) {
    logger.debug(`Unauthorized admin access attempt: ${email}`)
    return c.json({ error: "Unauthorized request" }, 401)
  }

  logger.debug(`Admin access granted for: ${email}`)
  await next()
}
