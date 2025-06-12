import type { AppContext } from "../types/context"
import { emailTypes } from "../lib/email-types"

/**
 * Get all email types
 * @param c - The context object
 * @returns A JSON response with the success status and data
 */
export const getTypes = (c: AppContext) => {
  return c.json({ success: true, data: emailTypes })
}
