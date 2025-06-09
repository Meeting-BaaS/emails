import { z } from "zod"
import { emailIdsZod, emailFrequenciesZod } from "./preferences"

export const getRecipientsSchema = z.object({
  emailId: emailIdsZod,
  frequency: emailFrequenciesZod
})

export const saveContentSchema = z.object({
  emailType: emailIdsZod,
  content: z.string().min(1, "Content cannot be empty")
})
