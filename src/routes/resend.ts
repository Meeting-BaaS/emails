import { createHonoApp } from "../lib/hono"
import { handleResend } from "../handlers/resend"

const router = createHonoApp()

router.post("/", handleResend)

export default router
