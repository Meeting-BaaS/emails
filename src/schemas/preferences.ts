import { z } from "zod"
import { emailTypes } from "../lib/email-types"
import type { EmailFrequency, EmailId, EmailTypeDomain } from "../types/email-types"

const emailIds: EmailId[] = emailTypes.map((type) => type.id)
const emailFrequencies: EmailFrequency[] = ["Daily", "Weekly", "Monthly", "Never"]
const emailDomains: EmailTypeDomain[] = ["Reports", "Announcements", "Developers", "Account"]

const emailFrequenciesZod = z.enum(emailFrequencies as [string, ...string[]])

export const updatePreferenceSchema = z.object({
  frequency: emailFrequenciesZod
})

export const emailIdParamSchema = z.object({
  emailId: z.enum(emailIds as [string, ...string[]])
})

export const updateDomainPreferencesSchema = z.object({
  domain: z.enum(emailDomains as [string, ...string[]]),
  frequency: emailFrequenciesZod
})
