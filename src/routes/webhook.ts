import { handleEmailStatusWebhook } from "../handlers/email-status"
import { createHonoApp } from "../lib/hono"

const webhookRouter = createHonoApp()

webhookRouter.post("/email-status", handleEmailStatusWebhook)

export default webhookRouter
