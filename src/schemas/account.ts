import { z } from "zod"

export const saveDefaultPreferencesSchema = z.object({
  accountId: z.number().int().positive()
})
