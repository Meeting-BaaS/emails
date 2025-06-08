import { createHonoApp } from "../../lib/hono"
import { handleUsageReports } from "../../handlers/resend/reports"

const reportsRouter = createHonoApp()

reportsRouter.post("/usage-reports", handleUsageReports)

export default reportsRouter
