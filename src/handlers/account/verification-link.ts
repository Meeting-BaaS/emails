import type { Context } from "hono"
import { z } from "zod"
import { logger } from "../../lib/logger"
import { SUPPORT_EMAIL, UNKNOWN_ERROR } from "../../lib/constants"
import { sendEmail } from "../../lib/send-email"
import { getVerificationLinkTemplate } from "../../lib/utils"
import { sendVerificationLinkEmailSchema } from "../../schemas/account"

export async function handleSendVerificationLinkEmail(c: Context) {
  try {
    const body = await c.req.json()
    const { email, firstName, url } = sendVerificationLinkEmailSchema.parse(body)

    const template = await getVerificationLinkTemplate()

    const data = {
      firstName: firstName || "there",
      url,
      supportEmail: SUPPORT_EMAIL,
      hideUnsubscribeLink: true,
      year: new Date().getFullYear()
    }

    const html = template(data)

    logger.debug(`Sending verification link email to ${email}`)
    const result = await sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html
    })

    // Since this is just a transactional email, we don't log it

    return c.json({ success: true, message: "Verification email sent", result })
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
