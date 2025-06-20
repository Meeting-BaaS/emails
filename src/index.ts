import { Hono } from "hono"
import { getAuthSession } from "./middlewares/session"
import { requestLogger } from "./middlewares/request-logger"
import { securityHeaders } from "./middlewares/security-headers"
import { notFoundHandler } from "./middlewares/not-found"
import { errorHandler } from "./middlewares/error-handler"
import { faviconHandler } from "./handlers/favicon"
import router from "./routes"
import accountRouter from "./routes/account"
import cronRouter from "./routes/cron"
import webhookRouter from "./routes/webhook"

const app = new Hono({
  strict: false
})

// Security headers
app.use("*", securityHeaders)

// Favicon
app.get("/favicon.ico", faviconHandler)

// Request logger
app.use("*", requestLogger)

// Account routes are protected by apiKeyMiddleware (inside the sub-router)
app.route("/account", accountRouter)
// Cron routes are protected by cronSecretMiddleware (inside the sub-router)
app.route("/cron", cronRouter)
// Webhook routes are protected by webhookMiddleware (inside the sub-router)
app.route("/webhook", webhookRouter)

// Auth session
app.use("*", getAuthSession)

// Test route
app.get("/test", (c) => c.json({ message: "This is a test route" }))

// Routes
app.route("/", router)

// Not found
app.notFound(notFoundHandler)

// Global error handler
app.onError(errorHandler)

export default app
