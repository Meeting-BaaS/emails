import { Hono } from "hono"
import type { User } from "../types/session"

/**
 * Creates a new Hono instance with our typed context
 * @returns A new Hono instance with our app context
 */
export const createHonoApp = () => {
  return new Hono<{
    Variables: {
      user: User
    }
  }>({
    strict: false
  })
}
