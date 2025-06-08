import { serve } from "@hono/node-server"
import app from "./index"
import { logger } from "./lib/logger"

const port = Number(process.env.PORT) || 3000

logger.info(`Hono server is running at http://localhost:${port}`)

const server = serve({ fetch: app.fetch, port })

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...")
  server.close(() => {
    logger.info("Server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...")
  server.close(() => {
    logger.info("Server closed")
    process.exit(0)
  })
})
