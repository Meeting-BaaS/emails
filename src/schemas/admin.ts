import { z } from "zod"
import { emailIdsZod, emailFrequenciesZod } from "./preferences"
import dayjs from "dayjs"

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
  recipients: z.array(recipientsSchema).min(1, "At least one recipient is required")
})

export const getEmailLogsSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number),
  offset: z.string().regex(/^\d+$/).transform(Number),
  emailId: emailIdsZod.optional(),
  accountEmail: z.string().email().optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => (val ? dayjs(val).isValid() : true), {
      message: "Invalid start date"
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => (val ? dayjs(val).isValid() : true), {
      message: "Invalid end date"
    })
})
