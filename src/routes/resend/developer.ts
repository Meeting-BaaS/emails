import { createHonoApp } from "../../lib/hono"

const developerRouter = createHonoApp()

developerRouter.post("/api_changes", async (c) => {
  // TODO: Implement API changes email sending
  return c.json({ message: "API changes email sent" })
})

developerRouter.post("/resources", async (c) => {
  // TODO: Implement developer resources email sending
  return c.json({ message: "Developer resources email sent" })
})

export default developerRouter
