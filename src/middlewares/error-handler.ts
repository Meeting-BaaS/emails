import type { Context } from "hono"
import { logger } from "../lib/logger"

/**
 * Middleware to handle runtime errors
 * @param err - The error that occurred
 * @param c - The Hono context
 * @returns JSON response with appropriate error status
 */
export const errorHandler = (err: Error, c: Context) => {
  // Log the error with stack trace
  logger.error({
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method
  })

  // Return a sanitized error response
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
    },
    500
  )
}
