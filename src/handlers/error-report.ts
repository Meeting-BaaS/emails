import type { AppContext } from "../types/context"
import { logger } from "../lib/logger"
import { sendErrorReportReplyEmail, sendNewErrorReportEmail } from "../lib/send-email"
import { logEmailSend } from "../lib/log-email"
import { ERROR_REPORT_SUBJECT, UNKNOWN_ERROR } from "../lib/constants"
import {
  generateErrorReportReplyMessageId,
  generateNewErrorReportMessageId,
  getErrorReportReplyTemplate,
  getErrorReportTemplate
} from "../lib/utils"
import { AI_CHAT_URL, LOGS_URL } from "../lib/external-urls"
import { errorReportReplySchema, newErrorReportSchema } from "../schemas/error-report"
import { db } from "../lib/db"
import { accounts, emailLogs } from "../database/migrations/schema"
import { and, desc, eq, sql } from "drizzle-orm"

export async function handleNewErrorReport(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user
    const body = await c.req.json()
    const { botUuid, chatId, additionalContext } = newErrorReportSchema.parse(body)

    const templateData = {
      firstName: firstname,
      botUuid,
      chatId,
      additionalContext,
      year: new Date().getFullYear(),
      chatLink: `${AI_CHAT_URL}/chat/${chatId}`,
      logLink: `${LOGS_URL}?bot_uuid=${botUuid}`
    }

    const template = await getErrorReportTemplate()

    const html = template(templateData)
    const messageId = generateNewErrorReportMessageId(botUuid)

    const subject = `${ERROR_REPORT_SUBJECT} - Bot ${botUuid}`

    const result = await sendNewErrorReportEmail({
      to: email,
      subject,
      html,
      messageId
    })

    await logEmailSend({
      accountId,
      emailType: "error-report",
      triggeredBy: "system",
      subject,
      metadata: { template: html, botUuid },
      messageIds: messageId
    })

    return c.json({
      success: true,
      message: "Error report received and confirmation email sent",
      result
    })
  } catch (error) {
    logger.error(
      `Error processing error report: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )
    logger.debug(`Error details: ${JSON.stringify(error)}`)

    return c.json({ success: false, message: "Error processing error report" }, 500)
  }
}

export async function handleErrorReportReply(c: AppContext) {
  try {
    const body = await c.req.json()
    const { botUuid, resolved, reply, accountEmail } = errorReportReplySchema.parse(body)

    const previousMessageIds = await db
      .select({
        messageIds: emailLogs.messageIds
      })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.emailType, "error-report"),
          sql`${emailLogs.metadata}->>'botUuid' = ${botUuid}`
        )
      )
      .limit(1)
      .orderBy(desc(emailLogs.sentAt))

    const errorReportUser = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, accountEmail))
      .limit(1)

    if (!errorReportUser?.[0]) {
      logger.debug(`No error report user found for email ${accountEmail}`)
      throw new Error("No error report user found")
    }

    if (!previousMessageIds?.[0]?.messageIds) {
      logger.debug(`No previous message IDs found for bot ${botUuid}`)
      throw new Error("No previous message IDs found")
    }

    const { firstname, id: errorReportUserId } = errorReportUser[0]
    const messageIds = previousMessageIds[0].messageIds.split(",")
    const lastMessageId = messageIds[messageIds.length - 1]
    const replyMatch = lastMessageId.match(/message-(\d+)@/)
    const currentMessageSequence = replyMatch ? Number(replyMatch[1]) + 1 : 0
    const currentMessageId = generateErrorReportReplyMessageId(botUuid, currentMessageSequence)

    const templateData = {
      firstName: firstname,
      botUuid,
      resolved,
      reply,
      year: new Date().getFullYear(),
      logLink: `${LOGS_URL}?botUuid=${botUuid}`
    }

    const template = await getErrorReportReplyTemplate()

    const html = template(templateData)
    const subject = `Re: ${ERROR_REPORT_SUBJECT} - Bot ${botUuid}`

    const result = await sendErrorReportReplyEmail({
      to: accountEmail,
      subject,
      html,
      messageId: currentMessageId,
      references: messageIds
    })

    const newMessageIds = [...messageIds, currentMessageId]

    await logEmailSend({
      accountId: errorReportUserId,
      emailType: "error-report",
      triggeredBy: "system",
      subject,
      metadata: { template: html, botUuid },
      messageIds: newMessageIds.join(",")
    })

    return c.json({
      success: true,
      message: "Error report reply email sent",
      result
    })
  } catch (error) {
    logger.error(
      `Error processing error report reply: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )
    logger.debug(`Error details: ${JSON.stringify(error)}`)

    return c.json({ success: false, message: "Error processing error report reply" }, 500)
  }
}
