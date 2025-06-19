import { eq, and, sql, isNotNull, count, gte, lte, like } from "drizzle-orm"
import { accounts, bots, botConsumption } from "../database/migrations/schema"
import { db } from "../lib/db"
import { logger } from "../lib/logger"
import { SUPPORT_EMAIL } from "../lib/constants"
import { sendBatchEmails } from "../lib/send-email"
import { logBatchEmailSend, type LogEmailParams } from "../lib/log-email"
import {
  formatNumber,
  getDuration,
  getDurationString,
  getEnvValue,
  getUsageReportTemplate
} from "../lib/utils"
import type { CreateBatchOptions } from "resend"
import { ANALYTICS_URL, USAGE_URL } from "../lib/external-urls"
import type { Context } from "hono"
import type { UserStats } from "../types/usage-reports"
import type { EmailFrequency, EmailType } from "../types/email-types"
import { formatUsageStats } from "./usage-reports"
import dayjs from "dayjs"

/**
 * Get usage statistics for all users combined
 * This aggregates data across all accounts into a single stats object
 * @param startDate - Start date for the stats
 * @param endDate - End date for the stats
 * @returns Map with account ID 0 containing aggregated stats for all users
 */
async function getUsageStatsForAllUsers(
  startDate: Date,
  endDate: Date
): Promise<Map<number, UserStats>> {
  // Get all bots and their consumption data for the date range
  // Note: This query aggregates data across all accounts without grouping by accountId
  const botsData = await db
    .select({
      totalBots: count(bots.id),
      avgLength: sql<number>`AVG(EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt}))) / 3600`,
      // Hours
      totalHours: sql<number>`SUM(EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt}))) / 3600`,
      // Tokens
      recordingTokens: sql<number>`COALESCE(SUM(${botConsumption.recordingTokens}), 0)`,
      transcriptionTokens: sql<number>`COALESCE(SUM(${botConsumption.transcriptionTokens} + ${botConsumption.transcriptionByokTokens} + ${botConsumption.streamingOutputTokens} + ${botConsumption.streamingInputTokens}), 0)`,
      // Error count
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
        isNotNull(bots.endedAt), // Bot must have ended
        gte(bots.endedAt, startDate.toISOString()),
        lte(bots.endedAt, endDate.toISOString()),
        sql`EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt})) > 0`, // Bot must have run for at least 1 second
        sql`EXTRACT(EPOCH FROM (${bots.endedAt} - ${bots.createdAt})) <= 15000` // Bot must have run for less than 15000 seconds (4 hours)
      )
    )

  logger.info(`Found ${botsData.length} bots for all users`)

  const userStatsEntries = await formatUsageStats(botsData)

  return userStatsEntries
}

/**
 * Send usage reports to internal users
 * This is a cron job, triggered using vercel.json.
 * Because it is a cron job, more logs are needed to track the progress.
 * @param c - The context object
 * @returns A JSON response indicating success or failure
 */
export async function sendInternalUsageReports(c: Context) {
  try {
    const frequency: EmailFrequency =
      (process.env.INTERNAL_USAGE_REPORT_FREQUENCY as EmailFrequency) || "Daily"
    const emailTypeId: EmailType["id"] = "usage-reports"
    const duration = getDuration(frequency)

    if (!duration) {
      throw new Error("Invalid frequency parameter, cron job is not triggered")
    }

    logger.info(`Initializing ${frequency} internal usage reports cron job`)

    // Get all meeting baas users
    const users = await db
      .select({
        accountId: accounts.id,
        email: accounts.email,
        firstname: accounts.firstname
      })
      .from(accounts)
      .where(like(accounts.email, "%@meetingbaas.com"))

    logger.info(`Found ${users.length} meeting baas users for ${frequency} internal usage reports`)

    if (users.length === 0) {
      logger.info(
        `No meeting baas users found for ${frequency} internal usage reports, cron job completed successfully`
      )
      return c.json({ success: true, message: "No users found" }, 200)
    }

    // Calculate date range for the report
    const { startDate, endDate } = duration

    logger.info("Calculating usage stats from all users")

    // Get all usage stats in a single query
    const allStats = await getUsageStatsForAllUsers(startDate, endDate)

    // For internal usage reports, we have data on account id 0
    const stats = allStats.get(0)

    if (!stats) {
      logger.info("No stats found, skipping")
      return c.json({ success: true, message: "No stats found" }, 200)
    }

    logger.info("Found usage stats using data from all users")

    // Get master template
    const template = await getUsageReportTemplate()

    const from = getEnvValue("RESEND_EMAIL_FROM")
    const subjectPrefix = "Meeting BaaS Usage Report •"
    const startDateString = dayjs(startDate).format("D MMM YYYY")
    const endDateString = dayjs(endDate).format("D MMM YYYY")
    const emailSubject = `${subjectPrefix} ${startDateString} - ${endDateString}`

    const templateBaseData = {
      durationString: getDurationString(frequency, startDate, endDate),
      supportEmail: SUPPORT_EMAIL,
      hideUnsubscribeLink: true,
      year: new Date().getFullYear(),
      analyticsLink: ANALYTICS_URL,
      usageLink: USAGE_URL,
      internalReport: true,
      // Stats data
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
    }

    const emailLogs: LogEmailParams[] = []
    const emails: CreateBatchOptions = []

    // Construct emails for each user's report
    for (const user of users) {
      const html = template({
        ...templateBaseData,
        firstName: user.firstname || "there"
      })

      emails.push({
        from,
        to: user.email,
        subject: emailSubject,
        html
      })

      emailLogs.push({
        accountId: user.accountId,
        emailType: emailTypeId,
        subject: emailSubject,
        triggeredBy: "internal-usage-reports-cron",
        metadata: { template: html }
      })
    }

    logger.info(`Sending ${emails.length} emails`)

    const allResendIds = await sendBatchEmails(emails)

    logger.info(`Inserting ${emailLogs.length} email logs`)

    await logBatchEmailSend(emailLogs, allResendIds)

    logger.info(`Cron job completed successfully for ${users.length} users`)
    return c.json(
      { success: true, message: "Internal usage reports cron job completed successfully" },
      200
    )
  } catch (error) {
    logger.error({ error }, "Failed to complete internal usage reports cron job")
    return c.json(
      { success: false, message: "Failed to complete internal usage reports cron job" },
      500
    )
  }
}
