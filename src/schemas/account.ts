import { z } from "zod"

const accountIdSchema = z.number().int().positive()

export const saveDefaultPreferencesSchema = z.object({
  accountId: accountIdSchema
})

export const sendVerificationLinkEmailSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  url: z.string().url()
})

export const sendResetPasswordEmailSchema = sendVerificationLinkEmailSchema

// snake_case because the request is coming from the backend server
export const sendInsufficientTokensEmailSchema = z.object({
  account_id: accountIdSchema,
  email: z.string().email(),
  first_name: z.string().optional(),
  available_tokens: z.number(), // Allow negative for overdraft
  required_tokens: z.number().positive() // Operations can't require negative tokens
})

// snake_case because the request is coming from the backend server
export const sendPaymentActivationEmailSchema = z.object({
  account_id: accountIdSchema,
  email: z.string().email(),
  first_name: z.string().optional(),
  token_balance: z.number() // Allow negative for overdraft
})
