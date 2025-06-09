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
import { logEmailSend } from "../../lib/log-email"
import { checkCoolDown } from "../../lib/check-cooldown"

export async function handleProductUpdates(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user

    // Check cool down before proceeding
    const coolDownResult = await checkCoolDown(accountId, "product-updates")
    if (!coolDownResult.canSend) {
      return c.json(
        {
          success: false,
          message: "Too many requests",
          nextAvailableAt: coolDownResult.nextAvailableAt
        },
        429
      )
    }

    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "Exciting new product updates are here!",
      mainContent:
        "We've just released new features and improvements to enhance your experience. Check out what's new and how it can benefit you.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">Explore New Features</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("product-updates"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Product Updates",
      html
    })

    await logEmailSend({
      accountId,
      emailType: "product-updates"
    })

    return c.json({ success: true, message: "Product updates email sent", result })
  } catch (error) {
    logger.error(
      `Error sending product updates email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    await logEmailSend({
      accountId: user.id,
      emailType: "product-updates",
      success: false,
      errorMessage: error instanceof Error ? error.message : UNKNOWN_ERROR
    })

    return c.json({ success: false, message: "Error sending product updates email" }, 500)
  }
}

export async function handleMaintenance(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user

    // Check cool down before proceeding
    const coolDownResult = await checkCoolDown(accountId, "maintenance")
    if (!coolDownResult.canSend) {
      return c.json(
        {
          success: false,
          message: "Too many requests",
          nextAvailableAt: coolDownResult.nextAvailableAt
        },
        429
      )
    }

    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "Scheduled maintenance notification.",
      mainContent:
        "We'll be performing scheduled maintenance to improve our services. During this time, some features may be temporarily unavailable.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">View Maintenance Schedule</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("maintenance"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Maintenance Notification",
      html
    })

    await logEmailSend({
      accountId,
      emailType: "maintenance"
    })

    return c.json({ success: true, message: "Maintenance notification email sent", result })
  } catch (error) {
    logger.error(
      `Error sending maintenance notification email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    await logEmailSend({
      accountId: user.id,
      emailType: "maintenance",
      success: false,
      errorMessage: error instanceof Error ? error.message : UNKNOWN_ERROR
    })

    return c.json({ success: false, message: "Error sending maintenance notification email" }, 500)
  }
}

export async function handleCompanyNews(c: AppContext) {
  const user = c.get("user")
  try {
    const { firstname, email, id: accountId } = user

    // Check cool down before proceeding
    const coolDownResult = await checkCoolDown(accountId, "company-news")
    if (!coolDownResult.canSend) {
      return c.json(
        {
          success: false,
          message: "Too many requests",
          nextAvailableAt: coolDownResult.nextAvailableAt
        },
        429
      )
    }

    const template = await getMasterTemplate()

    const data = {
      firstName: firstname,
      introText: "Latest company news and updates.",
      mainContent:
        "Stay informed about our latest company news, achievements, and upcoming initiatives. We're excited to share our progress with you.",
      ctaButton:
        '<a href="#" style="background:#78fff0;color:#232323;padding:10px 20px;border-radius:5px;text-decoration:none;">Read More</a>',
      productName: PRODUCT_NAME,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      companyDetails: COMPANY_DETAILS,
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink("company-news"),
      year: new Date().getFullYear()
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Company News",
      html
    })

    await logEmailSend({
      accountId,
      emailType: "company-news"
    })

    return c.json({ success: true, message: "Company news email sent", result })
  } catch (error) {
    logger.error(
      `Error sending company news email: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    await logEmailSend({
      accountId: user.id,
      emailType: "company-news",
      success: false,
      errorMessage: error instanceof Error ? error.message : UNKNOWN_ERROR
    })

    return c.json({ success: false, message: "Error sending company news email" }, 500)
  }
}
