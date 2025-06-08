import { sendEmail } from "../../lib/send-email"
import { getMasterTemplate, getUnsubscribeLink } from "../../lib/utils"
import { logger } from "../../lib/logger"
import {
  COMPANY_ADDRESS,
  COMPANY_DETAILS,
  COMPANY_NAME,
  PRODUCT_NAME,
  SUPPORT_EMAIL,
  UNKNOWN_ERROR
} from "../../lib/constants"
import type { AppContext } from "../../types/context"
import { logEmailSend } from "../../lib/log-email"

export async function handleApiChanges(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user
    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "Important API changes coming your way.",
      mainContent:
        "We're making some significant updates to our API. Please review the changes and update your integrations accordingly.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">View API Changes</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("api-changes"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "API Changes Notification",
      html
    })

    await logEmailSend({
      accountId,
      emailType: "api-changes"
    })

    return c.json({ success: true, message: "API changes email sent", result })
  } catch (error) {
    logger.error(
      `Error sending API changes email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    await logEmailSend({
      accountId: user.id,
      emailType: "api-changes",
      success: false,
      errorMessage: error instanceof Error ? error.message : UNKNOWN_ERROR
    })

    return c.json({ success: false, message: "Error sending API changes email" }, 500)
  }
}

export async function handleDeveloperResources(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user
    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "New developer resources available.",
      mainContent:
        "We've added new documentation, tutorials, and sample code to help you build better integrations.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">Explore Resources</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("developer-resources"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Developer Resources Update",
      html
    })

    await logEmailSend({
      accountId,
      emailType: "developer-resources"
    })

    return c.json({ success: true, message: "Developer resources email sent", result })
  } catch (error) {
    logger.error(
      `Error sending developer resources email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    await logEmailSend({
      accountId: user.id,
      emailType: "developer-resources",
      success: false,
      errorMessage: error instanceof Error ? error.message : UNKNOWN_ERROR
    })

    return c.json({ success: false, message: "Error sending developer resources email" }, 500)
  }
}
