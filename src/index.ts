import { Hono } from "hono"
import { getAuthSession } from "./middlewares/session"
import { requestLogger } from "./middlewares/request-logger"
import { securityHeaders } from "./middlewares/security-headers"
import { notFoundHandler } from "./middlewares/not-found"
import { errorHandler } from "./middlewares/error-handler"
import { faviconHandler } from "./handlers/favicon"
import router from "./routes"

const app = new Hono({
  strict: false
})

// Security headers
app.use("*", securityHeaders)

// Favicon
app.get("/favicon.ico", faviconHandler)

// Middlewares
app.use("*", requestLogger)
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
