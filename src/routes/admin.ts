import { createHonoApp } from "../lib/hono"
import { getRecipients } from "../handlers/admin/recipients"
import { getRecipientsSchema } from "../schemas/admin"
import { zValidator } from "@hono/zod-validator"
import { adminMiddleware } from "../middlewares/admin"

const adminRouter = createHonoApp()

adminRouter.use("*", adminMiddleware)

adminRouter.get("/recipients", zValidator("query", getRecipientsSchema), getRecipients)

export default adminRouter
