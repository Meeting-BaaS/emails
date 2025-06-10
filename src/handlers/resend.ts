import type { AppContext } from "../types/context"
import { logger } from "../lib/logger"
import { resendSchema } from "../schemas/resend"
import { checkCoolDown } from "../lib/check-cooldown"
import type { EmailType } from "../types/email-types"
import { db } from "../lib/db"
import { emailLogs } from "../database/migrations/schema"
import { and, desc, eq } from "drizzle-orm"
import { sendEmail } from "../lib/send-email"
import { logEmailSend } from "../lib/log-email"
import { UNKNOWN_ERROR } from "../lib/constants"
import Handlebars from "handlebars"
import { broadcastedEmailsData } from "./admin/send-email"
import { emailTypes } from "../lib/email-types"

interface EmailMetadata {
  template: string
}

export async function handleResend(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user
    const body = await c.req.json()
    const { emailId, frequency } = resendSchema.parse(body)

    // Check cool down before proceeding
    const coolDownResult = await checkCoolDown(accountId, emailId as EmailType["id"])
    if (!coolDownResult.canSend) {
      logger.debug(`Cool down period active, next available at: ${coolDownResult.nextAvailableAt}`)
      return c.json(
        {
          success: false,
          message: "Too many requests",
          nextAvailableAt: coolDownResult.nextAvailableAt
        },
        429
      )
    }

    const isBroadcastedEmail = emailTypes.some(
      (type) => type.id === emailId && type.broadcast === true
    )

    const conditions = [
      eq(emailLogs.emailType, emailId as EmailType["id"]),
      eq(emailLogs.success, true)
    ]

    // If the email is not broadcasted, add the accountId condition
    // Broadcasted emails are sent to all accounts, where as non-broadcasted emails are personalized
    if (!isBroadcastedEmail) {
      conditions.push(eq(emailLogs.accountId, accountId))
    }

    // Get the latest email sent for this email type
    const latestEmail = await db
      .select()
      .from(emailLogs)
      .where(and(...conditions))
      .orderBy(desc(emailLogs.sentAt))
      .limit(1)

    if (!latestEmail[0]) {
      logger.debug(`No previous email found for type ${emailId} and frequency ${frequency}`)
      return c.json({ success: false, message: "No email found" }, 422)
    }

    const latestEmailContent = (latestEmail[0].metadata as EmailMetadata)?.template
    const latestEmailSubject = latestEmail[0].subject

    if (!latestEmailContent) {
      return c.json({ success: false, message: "No email content found" }, 422)
    }

    const template = Handlebars.compile(latestEmailContent)

    const data = {
      firstName: firstname
    }

    const html = template(data)
    const subject = latestEmailSubject || broadcastedEmailsData[emailId as EmailType["id"]].subject

    const result = await sendEmail({
      to: email,
      subject,
      html
    })
    logger.debug(`Email sent successfully to ${email}`)

    await logEmailSend({
      accountId,
      emailType: emailId as EmailType["id"],
      triggeredBy: "user",
      subject,
      metadata: { template: latestEmailContent }
    })

    return c.json({
      success: true,
      message: `${subject} email sent`,
      result
    })
  } catch (error) {
    logger.error(`Error resending email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`)
    logger.debug(`Error details: ${JSON.stringify(error)}`)

    return c.json({ success: false, message: "Error resending email" }, 500)
  }
}
