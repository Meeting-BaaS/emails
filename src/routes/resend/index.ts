import announcementsRouter from "./announcements"
import developerRouter from "./developer"
import accountRouter from "./account"
import { createHonoApp } from "../../lib/hono"

const emailRouter = createHonoApp()

// Mount sub-routers
emailRouter.route("/announcements", announcementsRouter)
emailRouter.route("/developer", developerRouter)
emailRouter.route("/account", accountRouter)

export default emailRouter
