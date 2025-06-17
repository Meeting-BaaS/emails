import { handleSendInsufficientTokensEmail } from "../handlers/account/insufficient-tokens"
import { handleSendPaymentActivationEmail } from "../handlers/account/payment-activation"
import { saveDefaultPreferences } from "../handlers/default-preferences"
import { createHonoApp } from "../lib/hono"
import { apiKeyMiddleware } from "../middlewares/api-key"

const accountRouter = createHonoApp()

accountRouter.use("*", apiKeyMiddleware)

accountRouter.post("/insufficient-tokens", handleSendInsufficientTokensEmail)
accountRouter.post("/payment-activation", handleSendPaymentActivationEmail)
accountRouter.post("/default-preferences", saveDefaultPreferences)

export default accountRouter
