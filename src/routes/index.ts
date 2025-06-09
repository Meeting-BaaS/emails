import { createHonoApp } from "../lib/hono"
import resendRouter from "./resend"
import emailTypesRouter from "./email-types"
import defaultPreferencesRouter from "./default-preferences"
import preferencesRouter from "./preferences"
import adminRouter from "./admin"

const router = createHonoApp()

router.route("/types", emailTypesRouter)
router.route("/default-preferences", defaultPreferencesRouter)
router.route("/preferences", preferencesRouter)
router.route("/resend", resendRouter)
router.route("/admin", adminRouter)

export default router
