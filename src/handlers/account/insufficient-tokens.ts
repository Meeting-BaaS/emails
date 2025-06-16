import type { Context } from "hono"
import { sendInsufficientTokensEmailSchema } from "../../schemas/account"
import { logger } from "../../lib/logger"
import {
  DEFAULT_RECORDING_RATE,
  DEFAULT_STREAMING_OUTPUT_RATE,
  DEFAULT_TRANSCRIPTION_RATE,
  INSUFFICIENT_TOKENS_COOLDOWN,
  SUPPORT_EMAIL,
  SYSTEM_MESSAGE,
  UNKNOWN_ERROR
} from "../../lib/constants"
import { z } from "zod"
import { getInsufficientTokensTemplate, getUnsubscribeLink } from "../../lib/utils"
import { sendEmail } from "../../lib/send-email"
import { logEmailSend } from "../../lib/log-email"
import type { EmailType } from "../../types/email-types"
import { BILLING_URL } from "../../lib/external-urls"
import {
  fetchAllProducts,
  formatProductsToTokenPacks,
  formatTokenBalance
} from "../../lib/stripe-products"
import { checkSystemEmailCoolDown } from "../../lib/check-cooldown"
import { isUnsubscribed } from "../../lib/is-unsubscribed"

export async function handleSendInsufficientTokensEmail(c: Context) {
  try {
    const body = await c.req.json()
    const { account_id, email, first_name, available_tokens, required_tokens } =
      sendInsufficientTokensEmailSchema.parse(body)

    // Check if the account is subscribed to the email type
    // Even though the email is an insufficient tokens email,
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
      "insufficient_tokens_recording",
      INSUFFICIENT_TOKENS_COOLDOWN
    )

    if (!canSend) {
      logger.debug(
        `Insufficient tokens for account ${account_id} email cooldown: ${nextAvailableAt}`
      )
      return c.json(
        { success: false, message: "Insufficient tokens email cooldown", nextAvailableAt },
        429
      )
    }

    // Fetch and format product data from Stripe
    const products = await fetchAllProducts()
    const tokenPacks = formatProductsToTokenPacks(products)

    // Format token balances
    const available = formatTokenBalance(available_tokens)
    const required = formatTokenBalance(required_tokens)

    const template = await getInsufficientTokensTemplate()

    const data = {
      firstName: first_name,
      availableTokens: available,
      requiredTokens: required,
      tokenPacks,
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
      subject: "Recording Failed: Insufficient Token Balance",
      html
    })

    await logEmailSend({
      accountId: account_id,
      emailType: "insufficient_tokens_recording" as EmailType["id"],
      subject: "Recording Failed: Insufficient Token Balance",
      triggeredBy: "system",
      metadata: {
        template: html,
        resend_id: result.id,
        available_tokens: available_tokens.toString(),
        required_tokens: required_tokens.toString()
      }
    })

    return c.json({ success: true, message: "Insufficient tokens email sent", result })
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
