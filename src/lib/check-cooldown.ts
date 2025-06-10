import { db } from "./db"
import { emailLogs } from "../database/migrations/schema"
import { eq, and, gte } from "drizzle-orm"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { logger } from "./logger"
import type { EmailType } from "../types/email-types"

dayjs.extend(utc)

interface CoolDownResult {
  canSend: boolean
  nextAvailableAt?: string
  remainingAttempts?: number
}

/**
 * Check if the account has sent too many emails in the allowed period
 * @param accountId - The account ID
 * @param emailType - The email type
 * @returns - The cool down result
 */
export async function checkCoolDown(
  accountId: number,
  emailType: EmailType["id"]
): Promise<CoolDownResult> {
  const allowedPeriod = Number(process.env.RESENDS_ALLOWED_PERIOD) || 24 // Default to 24 hours
  const maxAttempts = Number(process.env.NUMBER_OF_RESENDS_ALLOWED) || 3 // Default to 3 attempts

  // Calculate the start timestamp (current time - allowed period)
  const startTimestamp = dayjs.utc().subtract(allowedPeriod, "hour").toISOString()

  try {
    // Get all logs within the period ordered by sentAt
    const logs = await db
      .select({ sentAt: emailLogs.sentAt })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.accountId, accountId),
          eq(emailLogs.emailType, emailType),
          eq(emailLogs.triggeredBy, "user"),
          eq(emailLogs.success, true),
          gte(emailLogs.sentAt, startTimestamp)
        )
      )
      .orderBy(emailLogs.sentAt)

    const sentCount = logs.length
    const remainingAttempts = maxAttempts - sentCount

    if (sentCount >= maxAttempts) {
      // Use the oldest log (first in the ordered results) to calculate next available time
      const nextAvailableAt = dayjs.utc(logs[0].sentAt).add(allowedPeriod, "hour").toISOString()

      return {
        canSend: false,
        nextAvailableAt
      }
    }

    return {
      canSend: true,
      remainingAttempts
    }
  } catch (error) {
    // If there's an error checking cool down, allow the request to proceed
    // but log the error for monitoring
    logger.error(
      `Error checking email cool down: ${error instanceof Error ? error.stack : "Unknown error"}`
    )
    return { canSend: true }
  }
}
