import announcementsRouter from "./announcements"
import developerRouter from "./developers"
import accountRouter from "./account"
import { createHonoApp } from "../../lib/hono"
import reportsRouter from "./reports"

const emailRouter = createHonoApp()

emailRouter.route("/reports", reportsRouter)
emailRouter.route("/announcements", announcementsRouter)
emailRouter.route("/developers", developerRouter)
emailRouter.route("/account", accountRouter)

export default emailRouter
