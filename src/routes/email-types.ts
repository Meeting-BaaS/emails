import { getTypes } from "../handlers/email-types"
import { createHonoApp } from "../lib/hono"

const router = createHonoApp()

router.get("/", getTypes)

export default router
