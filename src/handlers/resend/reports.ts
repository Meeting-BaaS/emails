import type { AppContext } from "../../types/context"
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

export async function handleUsageReports(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email } = user
    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "Your monthly usage report is ready.",
      mainContent:
        "Here's a summary of your account usage for the past month. Review your consumption patterns and optimize your resources.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">View Detailed Report</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("usage-reports"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Usage Report",
      html
    })

    return c.json({ success: true, message: "Usage report email sent", result })
  } catch (error) {
    logger.error(
      `Error sending usage report email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )
    return c.json({ success: false, message: "Error sending usage report email" }, 500)
  }
}
