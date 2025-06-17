import { sendUsageReports } from "../handlers/usage-reports"
import { createHonoApp } from "../lib/hono"
import { cronSecretMiddleware } from "../middlewares/api-key"

const cronRouter = createHonoApp()

cronRouter.use("*", cronSecretMiddleware)

cronRouter.get("/usage-reports", sendUsageReports)

export default cronRouter
