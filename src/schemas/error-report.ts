import { z } from "zod"

export const newErrorReportSchema = z.object({
  botUuid: z.string(),
  chatId: z.string(),
  additionalContext: z.string().optional()
})

export const errorReportReplySchema = z.object({
  botUuid: z.string(),
  resolved: z.boolean().optional(),
  reply: z.string(),
  accountEmail: z.string()
})
