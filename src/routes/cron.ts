import { sendInternalUsageReports } from "../handlers/internal-usage-report"
import { sendUsageReports } from "../handlers/usage-reports"
import { createHonoApp } from "../lib/hono"
import { cronSecretMiddleware } from "../middlewares/api-key"

const cronRouter = createHonoApp()

cronRouter.use("*", cronSecretMiddleware)

cronRouter.get("/usage-reports", sendUsageReports)
cronRouter.get("/internal-usage-reports", sendInternalUsageReports)

export default cronRouter
