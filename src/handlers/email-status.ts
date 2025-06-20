import type { Context } from "hono"
import { logger } from "../lib/logger"

export async function handleEmailStatusWebhook(c: Context) {
  const body = await c.req.json()
  logger.info(Object.fromEntries(c.req.raw.headers.entries()))
  logger.info(body)
  return c.json({ message: "Email status webhook received" })
}
