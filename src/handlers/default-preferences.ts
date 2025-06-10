import { eq } from "drizzle-orm"
import { emailPreferences } from "../database/migrations/schema"
import { db } from "../lib/db"
import type { AppContext } from "../types/context"
import { emailTypes } from "../lib/email-types"
import { UNKNOWN_ERROR } from "../lib/constants"
import { logger } from "../lib/logger"
import { currentDateUTC } from "../lib/utils"

/**
 * Save default preferences for a user, if they don't exist.
 * This function is called when a user signs up for the first time.
 * It will save email types with the default frequency.
 * @param c - The context object
 * @returns A JSON response with the success status and message
 */
export const saveDefaultPreferences = async (c: AppContext) => {
  const user = c.get("user")
  try {
    const { id } = user

    const currentPreferences = await db
      .select()
      .from(emailPreferences)
      .where(eq(emailPreferences.accountId, id))

    if (currentPreferences.length > 0) {
      logger.debug(`Preferences already exist for user: ${id}`)
      return c.json({ success: true, message: "Preferences already exist" }, 200)
    }

    const updatedAt = currentDateUTC()

    const newPreferences = emailTypes.map((type) => ({
      accountId: id,
      emailType: type.id,
      frequency: type.defaultFrequency,
      updatedAt
    }))

    await db.insert(emailPreferences).values(newPreferences)

    return c.json({ success: true, message: "Preferences saved successfully" }, 201)
  } catch (error) {
    logger.error(
      `Error saving preferences: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )
    return c.json({ success: false, message: "Error saving preferences" }, 500)
  }
}
