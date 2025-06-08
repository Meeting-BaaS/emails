import { createHonoApp } from "../../lib/hono"
import { handleApiChanges, handleDeveloperResources } from "../../handlers/resend/developers"

const developerRouter = createHonoApp()

developerRouter.post("/api-changes", handleApiChanges)
developerRouter.post("/developer-resources", handleDeveloperResources)

export default developerRouter
