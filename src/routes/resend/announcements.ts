import { createHonoApp } from "../../lib/hono"

const announcementsRouter = createHonoApp()

announcementsRouter.post("/product_updates", async (c) => {
  const user = c.get("user")
  // TODO: Implement product updates email sending
  return c.json({ message: "Product updates email sent" })
})

announcementsRouter.post("/maintenance", async (c) => {
  // TODO: Implement maintenance notification email sending
  return c.json({ message: "Maintenance notification email sent" })
})

announcementsRouter.post("/company_news", async (c) => {
  // TODO: Implement company news email sending
  return c.json({ message: "Company news email sent" })
})

export default announcementsRouter
