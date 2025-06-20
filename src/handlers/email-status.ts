import type { Context } from "hono"
import { logger } from "../lib/logger"
import type { WebhookEvent } from "../types/webhook"
import { db } from "../lib/db"
import { emailLogs } from "../database/migrations/schema"
import { sql } from "drizzle-orm"
import { UNKNOWN_ERROR } from "../lib/constants"
import { emailStatusSchema } from "../schemas/webhook"
import { z } from "zod"

export async function handleEmailStatusWebhook(c: Context) {
  const body: WebhookEvent = await c.req.json()

  try {
    const parsedBody = emailStatusSchema.parse(body)

    const {
      type,
      created_at,
      data: { email_id, created_at: data_created_at }
    } = parsedBody

    const webhookEventData = {
      type,
      created_at,
      data_created_at
    }
    // Update the email log with the webhook event type
    // We're looking for records where metadata->>'resend_id' equals the email_id from the webhook
    const result = await db
      .update(emailLogs)
      .set({
        metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{webhook_events}', COALESCE(metadata->'webhook_events', '[]'::jsonb) || ${JSON.stringify(
          webhookEventData
        )}::jsonb)`
      })
      .where(sql`metadata->>'resend_id' = ${email_id}`)
      .returning({
        id: emailLogs.id,
        accountId: emailLogs.accountId,
        emailType: emailLogs.emailType
      })

    if (result.length > 0) {
      logger.info(
        {
          emailId: email_id,
          webhookType: type,
          updatedRecords: result.length,
          recordIds: result.map((r) => r.id)
        },
        "Updated email logs with webhook event"
      )
    } else {
      logger.warn(
        {
          emailId: email_id,
          webhookType: type
        },
        "No email log found with matching resend_id"
      )
    }

    return c.json({
      message: "Email status webhook received",
      updated: result.length > 0,
      recordCount: result.length
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: "Invalid request body", errors: error.errors }, 400)
    }
    logger.error(
      {
        error,
        emailId: body.data.email_id,
        webhookType: body.type
      },
      "Failed to update email logs with webhook event"
    )

    return c.json(
      {
        message: "Email status webhook received but failed to update logs",
        error: error instanceof Error ? error.message : UNKNOWN_ERROR
      },
      500
    )
  }
}
