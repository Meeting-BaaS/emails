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

export async function handleSecurityAlert(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user
    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "Important security update for your account.",
      mainContent:
        "We've detected some unusual activity on your account. Please review your recent activity and update your security settings.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">Review Security Settings</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("security"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Security Alert",
      html
    })

    await logEmailSend({
      accountId,
      emailType: "security"
    })

    return c.json({ success: true, message: "Security alert email sent", result })
  } catch (error) {
    logger.error(
      `Error sending security alert email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    await logEmailSend({
      accountId: user.id,
      emailType: "security",
      success: false,
      errorMessage: error instanceof Error ? error.message : UNKNOWN_ERROR
    })

    return c.json({ success: false, message: "Error sending security alert email" }, 500)
  }
}

export async function handleBillingNotification(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user
    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "Your billing statement is ready.",
      mainContent:
        "Your monthly billing statement is now available. Please review your charges and payment history.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">View Billing Statement</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("billing"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Billing Notification",
      html
    })

    await logEmailSend({
      accountId,
      emailType: "billing"
    })

    return c.json({ success: true, message: "Billing notification email sent", result })
  } catch (error) {
    logger.error(
      `Error sending billing notification email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    await logEmailSend({
      accountId: user.id,
      emailType: "billing",
      success: false,
      errorMessage: error instanceof Error ? error.message : UNKNOWN_ERROR
    })

    return c.json({ success: false, message: "Error sending billing notification email" }, 500)
  }
}
