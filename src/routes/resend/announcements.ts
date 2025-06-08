import { createHonoApp } from "../../lib/hono"
import {
  handleProductUpdates,
  handleMaintenance,
  handleCompanyNews
} from "../../handlers/resend/announcements"

const announcementsRouter = createHonoApp()

announcementsRouter.post("/product-updates", handleProductUpdates)
announcementsRouter.post("/maintenance", handleMaintenance)
announcementsRouter.post("/company-news", handleCompanyNews)

export default announcementsRouter
