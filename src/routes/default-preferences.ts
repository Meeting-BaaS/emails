import { createHonoApp } from "../lib/hono"
import { saveDefaultPreferences } from "../handlers/default-preferences"

const router = createHonoApp()

router.post("/", saveDefaultPreferences)

export default router
