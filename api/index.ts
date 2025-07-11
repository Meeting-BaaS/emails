import { handle } from "hono/vercel"
import app from "../dist/src/index.js"

export const runtime = "edge"

export const GET = handle(app)
export const POST = handle(app)
export const OPTIONS = handle(app)
// Added new method handlers
export const PUT = handle(app)
export const DELETE = handle(app)
