import { createHonoApp } from "../lib/hono"
import { getRecipients } from "../handlers/admin/recipients"
import { getBroadcastTypes } from "../handlers/admin/broadcast-types"
import { saveContent, getContents, updateContent, deleteContent } from "../handlers/admin/content"
import { getRecipientsSchema } from "../schemas/admin"
import { zValidator } from "@hono/zod-validator"
import { adminMiddleware } from "../middlewares/admin"
import { handleSendEmail } from "../handlers/admin/send-email"
import { getEmailLogs } from "../handlers/admin/email-logs"

const adminRouter = createHonoApp()

adminRouter.use("*", adminMiddleware)

adminRouter.get("/recipients", zValidator("query", getRecipientsSchema), getRecipients)
adminRouter.get("/broadcast-types", getBroadcastTypes)
adminRouter.get("/content", getContents)
adminRouter.post("/content", saveContent)
adminRouter.put("/content", updateContent)
adminRouter.delete("/content/:id", deleteContent)
adminRouter.post("/send-email", handleSendEmail)
adminRouter.get("/email-logs", getEmailLogs)

export default adminRouter
