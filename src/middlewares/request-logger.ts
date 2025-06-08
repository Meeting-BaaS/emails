import type { Context, Next } from "hono"
import { logger } from "../lib/logger"

/**
 * Logs the request and response details
 * @param c - The Hono context
 * @param next - The next middleware function
 */
export const requestLogger = async (c: Context, next: Next) => {
  const startTime = Date.now()
  const method = c.req.method
  const path = c.req.path
  const query = c.req.query()
  const headers = Object.fromEntries(c.req.raw.headers.entries())

  logger.info(`Incoming ${method} request to ${path}`)
  logger.debug({
    type: "request",
    method,
    path,
    query,
    headers: {
      ...headers,
      // Mask sensitive headers
      authorization: headers.authorization ? "[REDACTED]" : undefined,
      cookie: headers.cookie ? "[REDACTED]" : undefined
    }
  })

  // Wait for the response
  await next()

  // Calculate response time
  const responseTime = Date.now() - startTime

  logger.info(`Completed ${method} ${path} with status ${c.res.status} in ${responseTime}ms`)

  logger.debug({
    type: "response",
    method,
    path,
    status: c.res.status,
    responseTime: `${responseTime}ms`
  })
}
