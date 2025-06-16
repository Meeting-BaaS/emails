import type { AppContext } from "../../types/context"
import { db } from "../../lib/db"
import { emailLogs, accounts } from "../../database/migrations/schema"
import { logger } from "../../lib/logger"
import { UNKNOWN_ERROR } from "../../lib/constants"
import { desc, eq, and, lte, gte } from "drizzle-orm"
import { getEmailLogsSchema } from "../../schemas/admin"
import type { EmailType } from "../../types/email-types"
import { z } from "zod"

export async function getEmailLogs(c: AppContext) {
  try {
    const { limit, offset, emailId, accountEmail, startDate, endDate } = getEmailLogsSchema.parse(
      c.req.query()
    )
    const whereClauses = []

    if (emailId) {
      whereClauses.push(eq(emailLogs.emailType, emailId as EmailType["id"]))
    }

    let accountId: number | undefined
    if (accountEmail) {
      const account = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.email, accountEmail))
        .limit(1)
      if (account.length > 0) {
        accountId = account[0].id
        whereClauses.push(eq(emailLogs.accountId, accountId))
      } else {
        // No such account, return empty result
        return c.json({ success: true, data: [], hasMore: false })
      }
    }

    if (startDate) {
      whereClauses.push(gte(emailLogs.sentAt, startDate))
    }
    if (endDate) {
      whereClauses.push(lte(emailLogs.sentAt, endDate))
    }

    // Compose the where clause
    const where = whereClauses.length > 0 ? and(...whereClauses) : undefined

    // Fetch logs with pagination (+1 for hasMore)
    const logs = await db
      .select({
        id: emailLogs.id,
        emailType: emailLogs.emailType,
        sentAt: emailLogs.sentAt,
        subject: emailLogs.subject,
        triggeredBy: emailLogs.triggeredBy,
        email: accounts.email,
        fullName: accounts.fullName
      })
      .from(emailLogs)
      .innerJoin(accounts, eq(emailLogs.accountId, accounts.id))
      .where(where)
      .orderBy(desc(emailLogs.sentAt))
      .limit(Number(limit) + 1)
      .offset(Number(offset))

    const hasMore = logs.length > Number(limit)
    const data = hasMore ? logs.slice(0, Number(limit)) : logs

    return c.json({
      success: true,
      data,
      hasMore
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: "Invalid query params", errors: error.errors }, 400)
    }
    logger.error(
      `Error fetching email logs: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )
    return c.json(
      {
        success: false,
        message: "Failed to fetch email logs"
      },
      500
    )
  }
}
