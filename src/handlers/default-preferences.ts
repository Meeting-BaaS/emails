import { eq } from "drizzle-orm"
import { emailPreferences } from "../database/migrations/schema"
import { db } from "../lib/db"
import { emailTypes } from "../lib/email-types"
import { UNKNOWN_ERROR } from "../lib/constants"
import { logger } from "../lib/logger"
import { currentDateUTC } from "../lib/utils"
import type { Context } from "hono"
import { saveDefaultPreferencesSchema } from "../schemas/account"
import { z } from "zod"

/**
 * Save default preferences for a user, if they don't exist.
 * This function is called when a user signs up/logs in
 * It will save email types with the default frequency.
 * @param c - The context object
 * @returns A JSON response with the success status and message
 */
export const saveDefaultPreferences = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { accountId } = saveDefaultPreferencesSchema.parse(body)

    const exists = await db
      .select({ id: emailPreferences.id })
      .from(emailPreferences)
      .where(eq(emailPreferences.accountId, accountId))
      .limit(1)

    if (exists.length > 0) {
      logger.debug(`Preferences already exist for user: ${accountId}`)
      return c.json({ success: true, message: "Preferences already exist" }, 200)
    }

    const updatedAt = currentDateUTC()

    const newPreferences = emailTypes.map((type) => ({
      accountId,
      emailType: type.id,
      frequency: type.defaultFrequency,
      updatedAt
    }))

    await db.insert(emailPreferences).values(newPreferences).onConflictDoNothing()

    return c.json({ success: true, message: "Preferences saved successfully" }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: "Invalid request body", errors: error.errors }, 400)
    }
    logger.error(
      `Error saving preferences: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )
    return c.json({ success: false, message: "Error saving preferences" }, 500)
  }
}
