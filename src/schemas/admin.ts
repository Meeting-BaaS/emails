import { z } from "zod"
import { emailIdsZod, emailFrequenciesZod } from "./preferences"

export const getRecipientsSchema = z.object({
  emailId: emailIdsZod,
  frequency: emailFrequenciesZod
})

export const saveContentSchema = z.object({
  emailType: emailIdsZod,
  content: z.string().min(1, "Content cannot be empty"),
  contentText: z.string().min(1, "Content text cannot be empty")
})

export const sendEmailSchema = z.object({
  emailId: emailIdsZod,
  frequency: emailFrequenciesZod,
  contentIds: z.array(z.number()).min(1, "At least one content is required"),
  recipient: z.object({
    email: z.string().email("Invalid email address"),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required")
  })
})
