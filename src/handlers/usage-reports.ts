import { eq, and, sql, isNotNull, count, gte, lte, like, inArray } from "drizzle-orm"
import { emailPreferences, accounts, bots, botConsumption } from "../database/migrations/schema"
import { db } from "../lib/db"
import { logger } from "../lib/logger"
import {
  EMAIL_BATCH_DELAY_MS,
  SUPPORT_EMAIL,
  TRIGGER_USAGE_REPORTS_CRON_JOBS,
  USAGE_REPORTS_BATCH_SIZE
} from "../lib/constants"
import { sendBatchEmails } from "../lib/send-email"
import { logBatchEmailSend, type LogEmailParams } from "../lib/log-email"
import {
  formatNumber,
  getDuration,
  getDurationString,
  getEnvValue,
  getPlatformFromUrl,
  getSubject,
  getUnsubscribeLink,
  getUsageReportTemplate
} from "../lib/utils"
import type { CreateBatchOptions } from "resend"
import { ANALYTICS_URL, USAGE_URL } from "../lib/external-urls"
import type { Context } from "hono"
import type { UserStats } from "../types/usage-reports"
import type { EmailFrequency, EmailType } from "../types/email-types"
import { emailFrequenciesZod } from "../schemas/preferences"
import { z } from "zod"

/**
 * Get usage statistics for all subscribers
 * @param startDate - Start date for the stats
 * @param endDate - End date for the stats
 * @param accountIds - Array of account IDs to filter by
 * @returns Map of account IDs to their usage statistics
 */
async function getAllUsageStats(
  startDate: Date,
  endDate: Date,
  accountIds: number[]
): Promise<Map<number, UserStats>> {
  // Get all bots and their consumption data for the date range
  const botsData = await db
    .select({
      accountId: bots.accountId,
      totalBots: count(bots.id),
      avgLength: sql<number>`AVG(EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt}))) / 3600`,
      // Hours
      totalHours: sql<number>`SUM(EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt}))) / 3600`,
      // Tokens
      recordingTokens: sql<number>`COALESCE(SUM(${botConsumption.recordingTokens}), 0)`,
      transcriptionTokens: sql<number>`COALESCE(SUM(${botConsumption.transcriptionTokens} + ${botConsumption.transcriptionByokTokens} + ${botConsumption.streamingOutputTokens} + ${botConsumption.streamingInputTokens}), 0)`,
      // Error coount
      errorCount: sql<number>`COUNT(CASE WHEN ${bots.errors} IS NOT NULL THEN 1 END)`,
      totalCount: count(bots.id),
      // Get meeting URLs and errors for platform detection, ordered by creation time
      meetingUrls: sql<string[]>`array_agg(${bots.meetingUrl} ORDER BY ${bots.createdAt})`,
      errors: sql<string[]>`array_agg(${bots.errors} ORDER BY ${bots.createdAt})`
    })
    .from(bots)
    .leftJoin(botConsumption, eq(bots.id, botConsumption.botId))
    .where(
      and(
        inArray(bots.accountId, accountIds),
        isNotNull(bots.endedAt), // Bot must have ended
        gte(bots.endedAt, startDate.toISOString()),
        lte(bots.endedAt, endDate.toISOString()),
        sql`EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt})) > 0`, // Bot must have run for at least 1 second
        sql`EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt})) <= 15000`, // Bot must have run for less than 15000 seconds (4 hours)
        sql`(${bots.errors} IS NULL OR ${bots.errors} NOT LIKE '%Internal%')` // Bot must not have internal errors
      )
    )
    .groupBy(bots.accountId)

  logger.info(`Found ${botsData.length} bots for ${accountIds.length} accounts`)

  // Process data asynchronously using Promise.all
  const userStatsEntries = await Promise.all(
    botsData.map(async (data) => {
      // Process meeting URLs and errors to get platform stats
      const platformStats = data.meetingUrls.reduce(
        (acc, url, index) => {
          if (!url) {
            return acc
          }
          const platform = getPlatformFromUrl(url)

          if (platform === "unknown") {
            logger.warn(`Unknown platform for meeting URL: ${url}, skipping`)
            return acc
          }

          // Increment total count
          acc[platform].value++

          // Increment success count if no errors
          if (!data.errors[index]) {
            acc[platform].success++
          }

          return acc
        },
        {
          googleMeet: { value: 0, success: 0 },
          zoom: { value: 0, success: 0 },
          teams: { value: 0, success: 0 }
        }
      )

      return [
        data.accountId,
        {
          accountId: data.accountId,
          totalBots: Number(data.totalBots),
          avgLength: Number(data.avgLength),
          platformStats,
          hours: {
            recording: Number(data.totalHours),
            transcription: Number(data.totalHours)
          },
          tokens: {
            recording: Number(data.recordingTokens),
            transcription: Number(data.transcriptionTokens)
          },
          errorRate: Number(data.errorCount) / Number(data.totalCount)
        }
      ] as [number, UserStats]
    })
  )

  return new Map(userStatsEntries)
}

/**
 * Send usage reports to all users who have subscribed
 * This is a cron job, triggered using vercel.json.
 * Because it is a cron job, more logs are needed to track the progress.
 * @param c - The context object
 * @returns A JSON response indicating success or failure
 */
export async function sendUsageReports(c: Context) {
  try {
    if (!TRIGGER_USAGE_REPORTS_CRON_JOBS) {
      logger.info("Usage reports cron job is disabled")
      return c.json({ success: true, message: "Usage reports cron job is disabled" }, 200)
    }

    const frequency = emailFrequenciesZod.parse(c.req.query("frequency")) as EmailFrequency
    const duration = getDuration(frequency)

    if (frequency === "Never" || !duration) {
      logger.info("Frequency is Never, cron job is not triggered")
      return c.json(
        { success: true, message: "Frequency is Never, cron job is not triggered" },
        200
      )
    }

    const emailTypeId: EmailType["id"] = "usage-reports"
    logger.info(`Initializing usage reports cron job for ${frequency}`)
    // Get all users who have subscribed to usage reports
    const subscribers = await db
      .select({
        accountId: accounts.id,
        email: accounts.email,
        firstname: accounts.firstname
      })
      .from(accounts)
      .innerJoin(
        emailPreferences,
        and(
          eq(emailPreferences.accountId, accounts.id),
          eq(emailPreferences.emailType, emailTypeId),
          eq(emailPreferences.frequency, frequency),
          // TODO: Initially, emails are only sent to meetingbaas.com emails
          // We will remove this once we are ready to send emails to all users
          like(accounts.email, "%@meetingbaas.com")
        )
      )
    logger.info(`Found ${subscribers.length} subscribers for ${frequency} usage reports`)

    if (subscribers.length === 0) {
      logger.info(
        `No subscribers found for ${frequency} usage reports, cron job completed successfully`
      )
      return c.json({ success: true, message: "No subscribers found" }, 200)
    }

    // Calculate date range for the report
    const { startDate, endDate } = duration

    logger.info(`Calculating usage stats for ${subscribers.length} subscribers`)
    // Get all usage stats in a single query
    const allStats = await getAllUsageStats(
      startDate,
      endDate,
      subscribers.map((s) => s.accountId)
    )
    logger.info(`Found ${allStats.size} usage stats for ${subscribers.length} subscribers`)

    // Get master template
    const template = await getUsageReportTemplate()
    const from = getEnvValue("RESEND_EMAIL_FROM")
    const emailSubject = getSubject(frequency, startDate, endDate)
    const templateBaseData = {
      durationString: getDurationString(frequency, startDate, endDate),
      supportEmail: SUPPORT_EMAIL,
      unsubscribeLink: getUnsubscribeLink(emailTypeId),
      year: new Date().getFullYear(),
      analyticsLink: ANALYTICS_URL,
      usageLink: USAGE_URL
    }

    // Prepare email batches
    const batches: CreateBatchOptions[] = []
    let currentBatch: CreateBatchOptions = []
    const emailLogs: LogEmailParams[] = []

    // Process each account's stats
    for (const subscriber of subscribers) {
      const stats = allStats.get(subscriber.accountId)

      if (!stats) {
        logger.info(`No stats found for subscriber ${subscriber.accountId}, skipping`)
        continue
      }

      // Format numbers where needed (percentage, hours, tokens)
      const html = template({
        ...templateBaseData,
        firstName: subscriber.firstname || "there",
        totalBots: stats.totalBots,
        totalHours: formatNumber(stats.hours.recording),
        totalTokens: formatNumber(stats.tokens.recording),
        errorRate: formatNumber(stats.errorRate * 100),
        avgLength: formatNumber(stats.avgLength),
        googleMeet: stats.platformStats.googleMeet.value,
        googleMeetPercentage: formatNumber(
          (stats.platformStats.googleMeet.value / stats.totalBots) * 100
        ),
        googleMeetSuccess: formatNumber(
          (stats.platformStats.googleMeet.success / stats.totalBots) * 100
        ),
        zoom: stats.platformStats.zoom.value,
        zoomPercentage: formatNumber((stats.platformStats.zoom.value / stats.totalBots) * 100),
        zoomSuccess: formatNumber((stats.platformStats.zoom.success / stats.totalBots) * 100),
        teams: stats.platformStats.teams.value,
        teamsPercentage: formatNumber((stats.platformStats.teams.value / stats.totalBots) * 100),
        teamsSuccess: formatNumber((stats.platformStats.teams.success / stats.totalBots) * 100),
        recordingHours: formatNumber(stats.hours.recording),
        transcriptionHours: formatNumber(stats.hours.transcription),
        recordingTokens: formatNumber(stats.tokens.recording),
        transcriptionTokens: formatNumber(stats.tokens.transcription)
      })

      currentBatch.push({
        from,
        to: subscriber.email,
        subject: emailSubject,
        html
      })

      emailLogs.push({
        accountId: subscriber.accountId,
        emailType: emailTypeId,
        subject: emailSubject,
        triggeredBy: "usage-reports-cron",
        metadata: { template: html }
      })

      if (currentBatch.length >= USAGE_REPORTS_BATCH_SIZE) {
        batches.push(currentBatch)
        currentBatch = []
      }
    }

    // Add the last batch if it has any recipients
    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }

    if (batches.length === 0) {
      logger.info("No batches to send, cron job completed successfully")
      return c.json({ success: true, message: "No batches to send" }, 200)
    }

    logger.info(`Sending ${batches.length} batches of ${USAGE_REPORTS_BATCH_SIZE} emails`)
    let batchIndex = 0
    // Send all batches
    for (const batch of batches) {
      batchIndex++
      logger.info(`Sending batch ${batchIndex} of ${batches.length}`)
      await sendBatchEmails(batch)
      logger.info(`Batch ${batchIndex} sent successfully`)
      // Wait for 1 second to avoid rate limiting from Resend
      await new Promise((resolve) => setTimeout(resolve, EMAIL_BATCH_DELAY_MS))
    }

    logger.info(`Inserting ${emailLogs.length} email logs`)
    if (emailLogs.length > 0) {
      await logBatchEmailSend(emailLogs)
    }

    logger.info(`Cron job completed successfully for ${subscribers.length} subscribers`)
    return c.json({ success: true, message: "Usage reports cron job completed successfully" }, 200)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("Invalid frequency parameter, cron job is not triggered", {
        errors: error.errors
      })
      return c.json(
        {
          success: false,
          message: "Invalid request parameters",
          errors: error.errors
        },
        400
      )
    }
    logger.error({ error }, "Failed to complete usage reports cron job")
    return c.json({ success: false, message: "Failed to complete usage reports cron job" }, 500)
  }
}
