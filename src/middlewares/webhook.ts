import type { Context, Next } from "hono"
import { logger } from "../lib/logger"
import { getEnvValue } from "../lib/utils"
import { Webhook } from "svix"

/**
 * Middleware to check if the webhook signature is valid
 * This middleware protects webhook routes as they are called by Svix, not users
 * @param c - The Hono context
 * @param next - The next middleware function
 */
export const webhookMiddleware = async (c: Context, next: Next) => {
  const WEBHOOK_SECRET = getEnvValue("WEBHOOK_SECRET")
  const wh = new Webhook(WEBHOOK_SECRET)

  logger.debug("verifying webhook signature")

  if (
    wh.verify(c.req.raw.body?.toString() ?? "", Object.fromEntries(c.req.raw.headers.entries()))
  ) {
    logger.debug("Webhook signature verified")
    return next()
  }

  logger.error("Unauthorized webhook attempt", {
    headers: Object.fromEntries(c.req.raw.headers.entries())
  })
  return c.json({ error: "Unauthorized Webhook request" }, 401)
}
