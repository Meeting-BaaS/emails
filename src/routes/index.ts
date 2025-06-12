import { createHonoApp } from "../lib/hono"
import resendRouter from "./resend"
import emailTypesRouter from "./email-types"
import preferencesRouter from "./preferences"
import adminRouter from "./admin"
import errorReportRouter from "./error-report"

const router = createHonoApp()

router.route("/types", emailTypesRouter)
router.route("/preferences", preferencesRouter)
router.route("/resend", resendRouter)
router.route("/admin", adminRouter)
router.route("/error-report", errorReportRouter)

export default router
