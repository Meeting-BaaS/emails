import { sendUsageReports } from "../handlers/usage-reports"
import { createHonoApp } from "../lib/hono"
import { apiKeyMiddleware } from "../middlewares/api-key"

const cronRouter = createHonoApp()

cronRouter.use("*", apiKeyMiddleware)

cronRouter.post("/usage-reports", sendUsageReports)

export default cronRouter
