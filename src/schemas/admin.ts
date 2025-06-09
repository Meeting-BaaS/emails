import { z } from "zod"
import { emailIdsZod, emailFrequenciesZod } from "./preferences"

export const getRecipientsSchema = z.object({
  emailId: emailIdsZod,
  frequency: emailFrequenciesZod
})
