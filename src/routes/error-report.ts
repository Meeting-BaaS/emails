import { createHonoApp } from "../lib/hono"
import { handleErrorReportReply, handleNewErrorReport } from "../handlers/error-report"

const router = createHonoApp()

router.post("/new", handleNewErrorReport)
router.post("/reply", handleErrorReportReply)

export default router
