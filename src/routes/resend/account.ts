import { createHonoApp } from "../../lib/hono"
import { handleSecurityAlert, handleBillingNotification } from "../../handlers/resend/account"

const accountRouter = createHonoApp()

accountRouter.post("/security", handleSecurityAlert)
accountRouter.post("/billing", handleBillingNotification)

export default accountRouter
