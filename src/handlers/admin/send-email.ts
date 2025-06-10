import type { AppContext } from "../../types/context"
import { logger } from "../../lib/logger"
import { SUPPORT_EMAIL, UNKNOWN_ERROR } from "../../lib/constants"
import { sendEmailSchema } from "../../schemas/admin"
import { db } from "../../lib/db"
import { accounts, emailContent } from "../../database/migrations/schema"
import { eq, inArray } from "drizzle-orm"
import { getMasterTemplate, getUnsubscribeLink } from "../../lib/utils"
import { sendEmail } from "../../lib/send-email"
import { logEmailSend } from "../../lib/log-email"
import type { EmailType } from "../../types/email-types"

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
    const { emailId, frequency, contentIds, recipient, subject } = sendEmailSchema.parse(body)
    const { email: adminEmail } = user

    const emailData = broadcastedEmailsData[emailId]

    const contentsArray = await db
      .select()
      .from(emailContent)
      .where(inArray(emailContent.id, contentIds))

    const template = await getMasterTemplate()

    const data = {
      firstName: recipient.firstname,
      mainContent: contentsArray.map((content) => content.content).join("<br><br>"),
      ctaButton: emailData.ctaButton,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink(emailId as EmailType["id"]),
      year: new Date().getFullYear()
    }

    const html = template(data)

    // Remove the first name from the template before logging
    // This is done to reuse the same template if user requests to send the same email again
    const htmlWithoutName = template({
      ...data,
      firstName: "{{firstName}}"
    })

    const emailSubject = subject || emailData.subject

    const result = await sendEmail({
      to: recipient.email,
      subject: emailSubject,
      html
    })

    const recipientAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, recipient.email))
      .limit(1)
      .then(([recipient]) => recipient)

    await logEmailSend({
      accountId: recipientAccount.id,
      emailType: emailId as EmailType["id"],
      subject: emailSubject,
      triggeredBy: adminEmail,
      metadata: { template: htmlWithoutName }
    })

    return c.json({ success: true, message: `${emailSubject} email sent`, result })
  } catch (error) {
    logger.error(`Error sending email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`)
    return c.json({ success: false, message: "Error sending email" }, 500)
  }
}
