import type { AppContext } from "../../types/context"
import { db } from "../../lib/db"
import { emailPreferences, accounts } from "../../database/migrations/schema"
import { eq, and } from "drizzle-orm"
import { logger } from "../../lib/logger"
import { UNKNOWN_ERROR } from "../../lib/constants"
import type { z } from "zod"
import type { getRecipientsSchema } from "../../schemas/admin"
import type { EmailType } from "../../types/email-types"

type GetRecipientsParams = z.infer<typeof getRecipientsSchema>

export async function getRecipients(c: AppContext) {
  try {
    const { emailId, frequency } = c.req.query() as GetRecipientsParams

    logger.debug("Fetching recipients", { emailId, frequency })

    // Get all matching preferences with account details
    const preferences = await db
      .select({
        email: accounts.email,
        firstname: accounts.firstname,
        lastname: accounts.lastname
      })
      .from(emailPreferences)
      .innerJoin(accounts, eq(emailPreferences.accountId, accounts.id))
      .where(
        and(
          eq(emailPreferences.emailType, emailId as EmailType["id"]),
          eq(emailPreferences.frequency, frequency)
        )
      )

    logger.debug(`Found ${preferences.length} recipients`)

    return c.json({
      success: true,
      data: preferences
    })
  } catch (error) {
    logger.error(
      `Error fetching recipients: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    return c.json(
      {
        success: false,
        message: "Failed to fetch recipients"
      },
      500
    )
  }
}
