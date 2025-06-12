import type { Next } from "hono"
import { logger } from "../lib/logger"
import type { AppContext } from "../types/context"
import { getEnvValue } from "../lib/utils"

const API_KEY = getEnvValue("EMAIL_SERVICE_API_KEY")

/**
 * Middleware to check if the api key is valid
 * This middleware protects account routes as they are called from the backend server, not users
 * @param c - The Hono context
 * @param next - The next middleware function
 */
export const apiKeyMiddleware = async (c: AppContext, next: Next) => {
  const requestApiKey = c.req.header("x-api-key")
  const authHeader = c.req.header("Authorization")

  logger.debug("Checking api key")

  if (requestApiKey && requestApiKey === API_KEY) {
    logger.debug("API key access granted using x-api-key")
    return next()
  }

  if (authHeader && authHeader === `Bearer ${API_KEY}`) {
    logger.debug("API key access granted using Authorization header")
    return next()
  }

  logger.error("Unauthorized api key attempt", {
    headers: Object.fromEntries(c.req.raw.headers.entries())
  })
  return c.json({ error: "Unauthorized API request" }, 401)
}
