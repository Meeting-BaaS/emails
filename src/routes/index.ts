import { createHonoApp } from "../lib/hono"
import resendRouter from "./resend"
import emailTypesRouter from "./email-types"
import defaultPreferencesRouter from "./default-preferences"

const router = createHonoApp()

router.route("/types", emailTypesRouter)
router.route("/default-preferences", defaultPreferencesRouter)
router.route("/resend", resendRouter)

export default router
