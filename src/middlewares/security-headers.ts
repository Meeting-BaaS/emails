import type { Context, Next } from "hono"

/**
 * Middleware to add security headers to all responses
 * @param c - The Hono context
 * @param next - The next middleware function
 */
export const securityHeaders = async (c: Context, next: Next) => {
  // Add security headers
  c.header("X-Content-Type-Options", "nosniff")
  c.header("X-Frame-Options", "DENY")
  c.header("X-XSS-Protection", "1; mode=block")
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  c.header("Content-Security-Policy", "default-src 'self'")
  c.header("Referrer-Policy", "strict-origin-when-cross-origin")
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  await next()
}
