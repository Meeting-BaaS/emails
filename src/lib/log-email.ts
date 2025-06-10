import { db } from "./db"
import { emailLogs } from "../database/migrations/schema"
import type { emailType } from "../database/migrations/schema"
import { logger } from "./logger"
import { currentDateUTC } from "./utils"

interface LogEmailParams {
  accountId: number
  emailType: (typeof emailType.enumValues)[number]
  success?: boolean
  errorMessage?: string
  metadata?: {
    template?: string
  }
  triggeredBy: string
  subject?: string
}

export async function logEmailSend({
  accountId,
  emailType,
  success = true,
  errorMessage,
  metadata,
  triggeredBy,
  subject
}: LogEmailParams) {
  try {
    const sentAt = currentDateUTC()
    await db.insert(emailLogs).values({
      accountId,
      emailType,
      success,
      errorMessage,
      sentAt,
      metadata,
      triggeredBy,
      subject
    })
    logger.debug("Email sent", {
      accountId,
      emailType,
      success,
      errorMessage,
      sentAt,
      metadata,
      triggeredBy,
      subject
    })
  } catch (error) {
    // Log the error but don't throw it - we don't want email logging failures to affect the main flow
    logger.error("Failed to log email send", {
      error,
      accountId,
      emailType,
      metadata,
      triggeredBy,
      subject
    })
  }
}
