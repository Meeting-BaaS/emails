import { createHonoApp } from "../../lib/hono"

const reportsRouter = createHonoApp()

reportsRouter.post("/usage-reports", async (c) => {
  // TODO: Implement usage report email sending
  return c.json({ message: "Usage report email sent" })
})

export default reportsRouter
