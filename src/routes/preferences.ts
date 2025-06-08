import { createHonoApp } from "../lib/hono"
import { getPreferences, updatePreference, updateDomainPreferences } from "../handlers/preferences"
import { emailIdParamSchema } from "../schemas/preferences"
import { zValidator } from "@hono/zod-validator"

const router = createHonoApp()

router.get("/", getPreferences)
router.post("/service", updateDomainPreferences)
router.post("/:emailId", zValidator("param", emailIdParamSchema), updatePreference)

export default router
