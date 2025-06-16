import { z } from "zod"
import { emailIdsZod, emailFrequenciesZod } from "./preferences"

export const getRecipientsSchema = z.object({
  emailId: emailIdsZod,
  frequency: emailFrequenciesZod,
  botCountLessThan: z.string().optional(),
  lastBotMoreThanDays: z.string().optional()
})

export const saveContentSchema = z.object({
  emailType: emailIdsZod,
  content: z.string().min(1, "Content cannot be empty"),
  contentText: z.string().min(1, "Content text cannot be empty")
})

const contentIdSchema = z.number().positive()

export const updateContentSchema = saveContentSchema.extend({
  id: contentIdSchema
})

export const deleteContentSchema = z.object({
  id: z
    .string()
    .transform((val) => Number(val))
    .pipe(contentIdSchema)
})

export const recipientsSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstname: z.string(),
  lastname: z.string()
})

export const sendEmailSchema = z.object({
  emailId: emailIdsZod,
  frequency: emailFrequenciesZod,
  subject: z.string().trim().optional(),
  contentIds: z.array(z.number()).min(1, "At least one content is required"),
  recipients: z.array(recipientsSchema)
})
