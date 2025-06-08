import { createHonoApp } from "../../lib/hono"

const accountRouter = createHonoApp()

accountRouter.post("/security", async (c) => {
  // TODO: Implement security alerts email sending
  return c.json({ message: "Security alert email sent" })
})

accountRouter.post("/billing", async (c) => {
  // TODO: Implement billing notifications email sending
  return c.json({ message: "Billing notification email sent" })
})

export default accountRouter
