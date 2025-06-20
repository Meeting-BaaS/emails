import { z } from "zod"
import type { WebhookType } from "../types/webhook"

const webhookTypeEnum: z.ZodEnum<[WebhookType, ...WebhookType[]]> = z.enum([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.complained",
  "email.bounced",
  "email.opened",
  "email.clicked"
])

export const emailStatusSchema = z.object({
  type: webhookTypeEnum,
  created_at: z.string(),
  data: z.object({
    email_id: z.string(),
    created_at: z.string(),
    click: z
      .object({
        link: z.string()
      })
      .optional()
  })
})
