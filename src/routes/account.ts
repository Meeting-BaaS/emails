import { handleSendInsufficientTokensEmail } from "../handlers/account/insufficient-tokens"
import { handleSendPaymentActivationEmail } from "../handlers/account/payment-activation"
import { handleSendVerificationLinkEmail } from "../handlers/account/verification-link"
import { handleSendResetPasswordEmail } from "../handlers/account/reset-password"
import { saveDefaultPreferences } from "../handlers/default-preferences"
import { createHonoApp } from "../lib/hono"
import { apiKeyMiddleware } from "../middlewares/api-key"

const accountRouter = createHonoApp()

accountRouter.use("*", apiKeyMiddleware)

accountRouter.post("/insufficient-tokens", handleSendInsufficientTokensEmail)
accountRouter.post("/payment-activation", handleSendPaymentActivationEmail)
accountRouter.post("/verification-email", handleSendVerificationLinkEmail)
accountRouter.post("/password-reset-email", handleSendResetPasswordEmail)
accountRouter.post("/default-preferences", saveDefaultPreferences)

export default accountRouter
