import { eq, and, inArray } from "drizzle-orm"
import { emailPreferences } from "../database/migrations/schema"
import { db } from "../lib/db"
import type { AppContext } from "../types/context"
import { UNKNOWN_ERROR } from "../lib/constants"
import { logger } from "../lib/logger"
import { emailTypes } from "../lib/email-types"
import type { EmailFrequency, EmailId } from "../types/email-types"
import { updatePreferenceSchema, updateDomainPreferencesSchema } from "../schemas/preferences"
import { z } from "zod"
import { currentDateUTC } from "../lib/utils"

/**
 * Get preferences for the current user
 * @param c - The context object
 * @returns A JSON response with the user's preferences formatted as an object with email type IDs as keys
 */
export const getPreferences = async (c: AppContext) => {
  const user = c.get("user")
  try {
    const { id } = user

    const preferences = await db
      .select()
      .from(emailPreferences)
      .where(eq(emailPreferences.accountId, id))

    // Create an object with all email types, defaulting to "never" frequency
    const formattedPreferences = emailTypes.reduce(
      (acc, type) => {
        acc[type.id] = type.defaultFrequency ?? "Never"
        return acc
      },
      {} as Record<EmailId, EmailFrequency>
    )

    // Update with actual preferences from database
    for (const pref of preferences) {
      if (pref.emailType in formattedPreferences) {
        formattedPreferences[pref.emailType] = pref.frequency as EmailFrequency
      }
    }

    return c.json({ success: true, preferences: formattedPreferences }, 200)
  } catch (error) {
    logger.error(
      `Error getting preferences: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )
    return c.json({ success: false, message: "Error getting preferences" }, 500)
  }
}

/**
 * Update a single email preference for the current user
 * @param c - The context object
 * @returns A JSON response indicating success or failure
 */
export const updatePreference = async (c: AppContext) => {
  const user = c.get("user")
  try {
    const { id } = user
    const emailId = c.req.param("emailId") as EmailId
    const body = await c.req.json()
    const { frequency } = updatePreferenceSchema.parse(body)

    const isRequired = emailTypes.find((t) => t.id === emailId)?.required
    if (isRequired && frequency === "Never") {
      logger.error(`User ${id} tried to disable a required email type: ${emailId}`)
      return c.json(
        { success: false, message: "This email type is mandatory and cannot be disabled" },
        400
      )
    }

    // Check if preference exists
    const existingPreference = await db
      .select()
      .from(emailPreferences)
      .where(and(eq(emailPreferences.accountId, id), eq(emailPreferences.emailType, emailId)))
      .limit(1)

    const updatedAt = currentDateUTC()

    if (existingPreference.length > 0) {
      // Update existing preference
      await db
        .update(emailPreferences)
        .set({ frequency, updatedAt })
        .where(and(eq(emailPreferences.accountId, id), eq(emailPreferences.emailType, emailId)))
    } else {
      // Create new preference
      await db.insert(emailPreferences).values({
        accountId: id,
        emailType: emailId,
        frequency,
        updatedAt
      })
    }

    return c.json({ success: true, message: "Preference updated successfully" }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: "Invalid request body", errors: error.errors }, 400)
    }
    logger.error(
      `Error updating preference: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )
    return c.json({ success: false, message: "Error updating preference" }, 500)
  }
}

/**
 * Update preferences for all emails in a specific domain
 * @param c - The context object
 * @returns A JSON response indicating success or failure
 */
export const updateDomainPreferences = async (c: AppContext) => {
  const user = c.get("user")
  try {
    const { id } = user
    const body = await c.req.json()
    const { domain, frequency } = updateDomainPreferencesSchema.parse(body)

    // Get all email types for the specified domain
    const domainEmailTypes = emailTypes
      .filter((type) => type.domain === domain)
      // If frequency is Never, exclude required email types
      .filter((type) => frequency !== "Never" || !type.required)
      .map((type) => type.id)

    // Get existing preferences for these email types
    const existingPreferences = await db
      .select()
      .from(emailPreferences)
      .where(
        and(
          eq(emailPreferences.accountId, id),
          inArray(emailPreferences.emailType, domainEmailTypes)
        )
      )

    // Create a set of existing email types for quick lookup
    const existingEmailTypes = new Set(existingPreferences.map((p) => p.emailType))

    const updatedAt = currentDateUTC()

    // Prepare arrays for bulk operations
    const toUpdateCount = existingPreferences.length

    const toInsert = domainEmailTypes
      .filter((emailType) => !existingEmailTypes.has(emailType))
      .map((emailType) => ({
        accountId: id,
        emailType,
        frequency,
        updatedAt
      }))

    // Perform bulk operations
    if (toUpdateCount > 0) {
      await db
        .update(emailPreferences)
        .set({ frequency, updatedAt })
        .where(
          and(
            eq(emailPreferences.accountId, id),
            inArray(emailPreferences.emailType, domainEmailTypes)
          )
        )
    }

    if (toInsert.length > 0) {
      await db.insert(emailPreferences).values(toInsert)
    }

    return c.json(
      {
        success: true,
        message: "Domain preferences updated successfully",
        updated: toUpdateCount,
        created: toInsert.length
      },
      201
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: "Invalid request body", errors: error.errors }, 400)
    }
    logger.error(
      `Error updating domain preferences: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )
    return c.json({ success: false, message: "Error updating domain preferences" }, 500)
  }
}
