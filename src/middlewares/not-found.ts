import type { Context } from "hono"

/**
 * Middleware to handle 404 Not Found responses
 * @param c - The Hono context
 * @returns JSON response with 404 status
 */
export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found",
      path: c.req.path
    },
    404
  )
}
