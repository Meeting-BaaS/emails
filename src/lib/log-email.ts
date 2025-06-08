import { db } from "./db"
import { emailLogs } from "../database/migrations/schema"
import type { emailType } from "../database/migrations/schema"
import { logger } from "./logger"

interface LogEmailParams {
  accountId: number
  emailType: (typeof emailType.enumValues)[number]
  success?: boolean
  errorMessage?: string
}

export async function logEmailSend({
  accountId,
  emailType,
  success = true,
  errorMessage
}: LogEmailParams) {
  try {
    const sentAt = new Date().toISOString()
    await db.insert(emailLogs).values({
      accountId,
      emailType,
      success,
      errorMessage,
      sentAt
    })
    logger.debug("Email sent", {
      accountId,
      emailType,
      success,
      errorMessage,
      sentAt
    })
  } catch (error) {
    // Log the error but don't throw it - we don't want email logging failures to affect the main flow
    logger.error("Failed to log email send", {
      error,
      accountId,
      emailType
    })
  }
}
