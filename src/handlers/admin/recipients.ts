import type { AppContext } from "../../types/context"
import { db } from "../../lib/db"
import { emailPreferences, accounts, bots } from "../../database/migrations/schema"
import { eq, and, sql, lt, gt } from "drizzle-orm"
import { logger } from "../../lib/logger"
import { UNKNOWN_ERROR } from "../../lib/constants"
import type { z } from "zod"
import type { getRecipientsSchema } from "../../schemas/admin"
import type { EmailType } from "../../types/email-types"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

type GetRecipientsParams = z.infer<typeof getRecipientsSchema>

export async function getRecipients(c: AppContext) {
  try {
    const { emailId, frequency, botCountLessThan, lastBotMoreThanDays } =
      c.req.query() as GetRecipientsParams

    logger.debug("Fetching recipients", {
      emailId,
      frequency,
      botCountLessThan,
      lastBotMoreThanDays
    })

    // Start building the query
    let query = db
      .select({
        email: accounts.email,
        firstname: accounts.firstname,
        lastname: accounts.lastname
      })
      .from(emailPreferences)
      .innerJoin(accounts, eq(emailPreferences.accountId, accounts.id))

    // Extract number from string like "5 bots" or "0 bots"
    const botCount = botCountLessThan && Number.parseInt(botCountLessThan.split(" ")[0])

    // Add bot count subquery if botCountLessThan is provided. 0 is a valid value.
    if (botCount !== undefined) {
      const botCountSubquery = db
        .select({
          accountId: bots.accountId,
          botCount: sql<number>`count(${bots.id}) as bot_count`
        })
        .from(bots)
        .groupBy(bots.accountId)
        .as("bot_counts")

      query = query.leftJoin(
        botCountSubquery,
        eq(emailPreferences.accountId, botCountSubquery.accountId)
      )
    }

    // Extract number from string like "10 days" or "7 days"
    const days = lastBotMoreThanDays && Number.parseInt(lastBotMoreThanDays.split(" ")[0])
    let daysAgo: string | undefined

    // Add last bot date filter if lastBotMoreThanDays is provided
    if (days) {
      daysAgo = dayjs.utc().subtract(days, "day").toISOString()

      const lastBotSubquery = db
        .select({
          accountId: bots.accountId,
          lastBotDate: sql<Date>`max(${bots.createdAt}) as last_bot_date`
        })
        .from(bots)
        .groupBy(bots.accountId)
        .as("last_bot_dates")

      query = query.leftJoin(
        lastBotSubquery,
        eq(emailPreferences.accountId, lastBotSubquery.accountId)
      )
    }

    // Build the where conditions
    const conditions = [
      eq(emailPreferences.emailType, emailId as EmailType["id"]),
      eq(emailPreferences.frequency, frequency)
    ]

    if (botCount !== undefined) {
      conditions.push(sql`COALESCE(bot_counts.bot_count, 0) <= ${botCount}`)
    }

    if (days && daysAgo) {
      conditions.push(
        sql`COALESCE(last_bot_dates.last_bot_date, '1970-01-01'::timestamp) < ${daysAgo}`
      )
    }

    // Add all conditions to the query
    const preferences = await query.where(and(...conditions))

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
