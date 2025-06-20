import { db } from "./db"
import { emailLogs } from "../database/migrations/schema"
import { logger } from "./logger"
import { currentDateUTC } from "./utils"
import type { EmailType } from "../types/email-types"
import type { CreateBatchSuccessResponse } from "resend"

export interface LogEmailParams {
  accountId: number
  emailType: EmailType["id"]
  success?: boolean
  errorMessage?: string
  metadata?: {
    resend_id?: string
    template?: string
    botUuid?: string
    available_tokens?: string
    required_tokens?: string
    token_balance?: string
  }
  triggeredBy: string
  subject?: string
  messageIds?: string
}

export async function logEmailSend({
  accountId,
  emailType,
  success = true,
  errorMessage,
  metadata,
  triggeredBy,
  subject,
  messageIds
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
      subject,
      messageIds
    })
    logger.debug(
      {
        accountId,
        emailType,
        success,
        errorMessage,
        sentAt,
        triggeredBy,
        subject,
        messageIds
      },
      "Email sent"
    )
  } catch (error) {
    // Log the error but don't throw it - we don't want email logging failures to affect the main flow
    logger.error(
      {
        error,
        accountId,
        emailType,
        triggeredBy,
        subject,
        messageIds
      },
      "Failed to log email send"
    )
  }
}

export async function logBatchEmailSend(
  emails: LogEmailParams[],
  resendIds: CreateBatchSuccessResponse["data"]
) {
  try {
    await db.insert(emailLogs).values(
      emails.map((email, index) => ({
        ...email,
        metadata: {
          ...email.metadata,
          resend_id: resendIds[index]?.id || "unknown"
        },
        sentAt: currentDateUTC()
      }))
    )
    logger.debug(
      {
        emailCount: emails.length
      },
      "Email sent"
    )
  } catch (error) {
    // Log the error but don't throw it - we don't want email logging failures to affect the main flow
    logger.error(
      {
        error,
        emailCount: emails.length
      },
      "Failed to log email send"
    )
  }
}
