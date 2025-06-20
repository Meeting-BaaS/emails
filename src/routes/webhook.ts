import { handleEmailStatusWebhook } from "../handlers/email-status"
import { createHonoApp } from "../lib/hono"
import { webhookMiddleware } from "../middlewares/webhook"

const webhookRouter = createHonoApp()

webhookRouter.use("*", webhookMiddleware)

webhookRouter.post("/email-status", handleEmailStatusWebhook)

export default webhookRouter
