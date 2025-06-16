import type { AppContext } from "../../types/context"
import { logger } from "../../lib/logger"
import { SUPPORT_EMAIL, UNKNOWN_ERROR } from "../../lib/constants"
import { sendEmailSchema } from "../../schemas/admin"
import { db } from "../../lib/db"
import { accounts, emailContent } from "../../database/migrations/schema"
import { inArray } from "drizzle-orm"
import { getEnvValue, getMasterTemplate, getUnsubscribeLink } from "../../lib/utils"
import { sendBatchEmails } from "../../lib/send-email"
import { logBatchEmailSend } from "../../lib/log-email"
import type { EmailType } from "../../types/email-types"
import { z } from "zod"
import type { CreateBatchOptions } from "resend"

export const broadcastedEmailsData: Record<string, { subject: string; ctaButton: string }> = {
  "product-updates": {
    subject: "Product Updates",
    ctaButton: ""
  },
  maintenance: {
    subject: "Maintenance Notification",
    ctaButton: ""
  },
  "company-news": {
    subject: "Company News",
    ctaButton: ""
  },
  "api-changes": {
    subject: "API Changes Notification",
    ctaButton: ""
  },
  "developer-resources": {
    subject: "New Developer Resources",
    ctaButton: ""
  }
}

export async function handleSendEmail(c: AppContext) {
  const user = c.get("user")
  try {
    const body = await c.req.json()
    const { emailId, contentIds, recipients, subject } = sendEmailSchema.parse(body)
    const { email: adminEmail } = user

    const emailData = broadcastedEmailsData[emailId]
    if (!emailData) {
      logger.error(`Unknown emailId: ${emailId}`)
      return c.json({ success: false, message: `Unknown emailId: ${emailId}` }, 400)
    }

    const contentsArray = await db
      .select()
      .from(emailContent)
      .where(inArray(emailContent.id, contentIds))

    if (contentsArray.length !== contentIds.length) {
      logger.error(`One or more content blocks were not found: ${contentIds.join(", ")}`)
      return c.json(
        {
          success: false,
          message: "One or more content blocks were not found"
        },
        400
      )
    }

    const recipientsArray = await db
      .select()
      .from(accounts)
      .where(
        inArray(
          accounts.email,
          recipients.map((recipient) => recipient.email)
        )
      )

    // Sort contentsArray to match the order of contentIds
    const orderedContents = contentIds.map(
      (id) => contentsArray.find((content) => content.id === id)!
    )

    const template = await getMasterTemplate()
    const emailSubject = subject || emailData.subject
    const templateBaseData = {
      mainContent: orderedContents.map((content) => content.content).join("<br><br>"),
      ctaButton: emailData.ctaButton,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink(emailId as EmailType["id"]),
      year: new Date().getFullYear()
    }

    const emails: CreateBatchOptions = []
    const emailLogs = []
    // Remove the first name from the template before logging
    // This is done to reuse the same template.
    // if user requests to send the same email again,
    // then we can use the latest email of the send email type
    const htmlWithoutName = template({
      ...templateBaseData,
      firstName: "{{firstName}}"
    })

    for (const recipient of recipientsArray) {
      const data = {
        firstName: recipient.firstname || "there", // In case first name is blank
        ...templateBaseData
      }

      const html = template(data)

      emails.push({
        from: getEnvValue("RESEND_EMAIL_FROM"),
        to: recipient.email,
        subject: emailSubject,
        html
      })

      emailLogs.push({
        accountId: recipient.id,
        emailType: emailId as EmailType["id"],
        subject: emailSubject,
        triggeredBy: adminEmail,
        metadata: { template: htmlWithoutName }
      })
    }

    await sendBatchEmails(emails)

    await logBatchEmailSend(emailLogs)

    return c.json({ success: true, message: `${emailSubject} email sent` })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: "Invalid request body", errors: error.errors }, 400)
    }
    logger.error(
      `Error sending email: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )
    return c.json({ success: false, message: "Error sending email" }, 500)
  }
}
