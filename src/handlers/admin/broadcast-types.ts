import type { AppContext } from "../../types/context"
import { emailTypes } from "../../lib/email-types"

/**
 * Get all email types that are marked as broadcast
 * @param c - The context object
 * @returns A JSON response with the success status and data
 */
export const getBroadcastTypes = (c: AppContext) => {
  const broadcastTypes = emailTypes.filter((type) => type.broadcast)
  return c.json({ success: true, data: broadcastTypes }, 200)
}
