import { z } from "zod"

const accountIdSchema = z.number().int().positive()

export const saveDefaultPreferencesSchema = z.object({
  accountId: accountIdSchema
})

export const sendInsufficientTokensEmailSchema = z.object({
  account_id: accountIdSchema,
  email: z.string().email(),
  first_name: z.string(),
  available_tokens: z.number(),
  required_tokens: z.number()
})

export const sendPaymentActivationEmailSchema = z.object({
  account_id: accountIdSchema,
  email: z.string().email(),
  first_name: z.string(),
  token_balance: z.number()
})
