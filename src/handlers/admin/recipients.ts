import type { AppContext } from "../../types/context"
import { db } from "../../lib/db"
import { emailPreferences, accounts } from "../../database/migrations/schema"
import type { emailType } from "../../database/migrations/schema"
import { eq, and } from "drizzle-orm"
import { logger } from "../../lib/logger"
import { UNKNOWN_ERROR } from "../../lib/constants"
import type { z } from "zod"
import type { getRecipientsSchema } from "../../schemas/admin"

type GetRecipientsParams = z.infer<typeof getRecipientsSchema>
type EmailType = (typeof emailType.enumValues)[number]

export async function getRecipients(c: AppContext) {
  try {
    const { emailId, frequency } = c.req.query() as GetRecipientsParams

    logger.debug("Fetching recipients", { emailId, frequency })

    // Get all matching preferences with account details
    const preferences = await db
      .select({
        accountId: emailPreferences.accountId,
        emailType: emailPreferences.emailType,
        frequency: emailPreferences.frequency,
        updatedAt: emailPreferences.updatedAt,
        email: accounts.email,
        firstname: accounts.firstname,
        lastname: accounts.lastname
      })
      .from(emailPreferences)
      .innerJoin(accounts, eq(emailPreferences.accountId, accounts.id))
      .where(
        and(
          eq(emailPreferences.emailType, emailId as EmailType),
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
