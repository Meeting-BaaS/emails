import { createHonoApp } from "../lib/hono"
import { getRecipients } from "../handlers/admin/recipients"
import { getBroadcastTypes } from "../handlers/admin/broadcast-types"
import { saveContent, getContents } from "../handlers/admin/content"
import { getRecipientsSchema } from "../schemas/admin"
import { zValidator } from "@hono/zod-validator"
import { adminMiddleware } from "../middlewares/admin"
import { handleSendEmail } from "../handlers/admin/send-email"

const adminRouter = createHonoApp()

adminRouter.use("*", adminMiddleware)

adminRouter.get("/recipients", zValidator("query", getRecipientsSchema), getRecipients)
adminRouter.get("/broadcast-types", getBroadcastTypes)
adminRouter.get("/content", getContents)
adminRouter.post("/content", saveContent)
adminRouter.post("/send-email", handleSendEmail)

export default adminRouter
