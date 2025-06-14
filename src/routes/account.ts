import { saveDefaultPreferences } from "../handlers/default-preferences"
import { createHonoApp } from "../lib/hono"
import { apiKeyMiddleware } from "../middlewares/api-key"

const accountRouter = createHonoApp()

accountRouter.use("*", apiKeyMiddleware)

accountRouter.post("/default-preferences", saveDefaultPreferences)

export default accountRouter
