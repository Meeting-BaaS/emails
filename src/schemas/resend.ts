import { z } from "zod"
import { emailFrequenciesZod, emailIdsZod } from "./preferences"

export const resendSchema = z.object({
  emailId: emailIdsZod,
  frequency: emailFrequenciesZod
})
