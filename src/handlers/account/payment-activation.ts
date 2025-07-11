import type { Context } from "hono"
import { z } from "zod"
import { logger } from "../../lib/logger"
import {
  DEFAULT_RECORDING_RATE,
  DEFAULT_STREAMING_OUTPUT_RATE,
  DEFAULT_TRANSCRIPTION_RATE,
  PAYMENT_ACTIVATION_COOLDOWN,
  SUPPORT_EMAIL,
  SYSTEM_MESSAGE,
  UNKNOWN_ERROR
} from "../../lib/constants"
import { formatNumber, getPaymentActivationTemplate, getUnsubscribeLink } from "../../lib/utils"
import { sendEmail } from "../../lib/send-email"
import { logEmailSend } from "../../lib/log-email"
import type { EmailType } from "../../types/email-types"
import { BILLING_URL } from "../../lib/external-urls"
import { checkSystemEmailCoolDown } from "../../lib/check-cooldown"
import { sendPaymentActivationEmailSchema } from "../../schemas/account"
import { isUnsubscribed } from "../../lib/is-unsubscribed"

export async function handleSendPaymentActivationEmail(c: Context) {
  try {
    const body = await c.req.json()
    const { account_id, email, first_name, token_balance } =
      sendPaymentActivationEmailSchema.parse(body)

    // Check if the account is subscribed to the email type
    // Even though the email is an payment activation email,
    // The unsubscribe link would be activity-updates for this kind of email
    const hasUnsubscribed = await isUnsubscribed(account_id, "activity-updates")
    if (hasUnsubscribed) {
      logger.debug(`Account ${account_id} is not subscribed to activity-updates, skipping email`)
      return c.json(
        { success: true, message: "Account is not subscribed to activity-updates" },
        200
      )
    }

    const { canSend, nextAvailableAt } = await checkSystemEmailCoolDown(
      account_id,
      "payment_activation",
      PAYMENT_ACTIVATION_COOLDOWN
    )

    if (!canSend) {
      logger.debug(
        `Payment activation for account ${account_id} email cooldown: ${nextAvailableAt}`
      )
      return c.json(
        { success: false, message: "Payment activation email cooldown", nextAvailableAt },
        429
      )
    }

    const template = await getPaymentActivationTemplate()

    // Format token balance
    const balance = formatNumber(token_balance)

    const data = {
      firstName: first_name || "there",
      tokenBalance: balance,
      recordingRate: DEFAULT_RECORDING_RATE,
      transcriptionRate: DEFAULT_TRANSCRIPTION_RATE,
      streamingRate: DEFAULT_STREAMING_OUTPUT_RATE,
      billingLink: BILLING_URL,
      supportEmail: SUPPORT_EMAIL,
      year: new Date().getFullYear(),
      unsubscribeLink: getUnsubscribeLink("activity-updates"),
      systemMessage: SYSTEM_MESSAGE
    }

    const html = template(data)

    const result = await sendEmail({
      to: email,
      subject: "Urgent: Recording Service Will Be Paused",
      html
    })

    await logEmailSend({
      accountId: account_id,
      emailType: "payment_activation" as EmailType["id"],
      subject: "Urgent: Recording Service Will Be Paused",
      triggeredBy: "system",
      metadata: {
        template: html,
        resend_id: result.id,
        token_balance: token_balance.toString()
      }
    })

    return c.json({ success: true, message: "Payment activation email sent", result })
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
