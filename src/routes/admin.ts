import { createHonoApp } from "../lib/hono"
import { getRecipients } from "../handlers/admin/recipients"
import { getBroadcastTypes } from "../handlers/admin/broadcast-types"
import { saveContent } from "../handlers/admin/content"
import { getRecipientsSchema } from "../schemas/admin"
import { zValidator } from "@hono/zod-validator"
import { adminMiddleware } from "../middlewares/admin"

const adminRouter = createHonoApp()

adminRouter.use("*", adminMiddleware)

adminRouter.get("/recipients", zValidator("query", getRecipientsSchema), getRecipients)
adminRouter.get("/broadcast-types", getBroadcastTypes)
adminRouter.post("/content", saveContent)

export default adminRouter
