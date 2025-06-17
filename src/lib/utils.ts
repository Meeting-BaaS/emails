import fs from "node:fs/promises"
import path, { join } from "node:path"
import Handlebars from "handlebars"
import type { EmailFrequency, EmailId } from "../types/email-types"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { SETTINGS_URL } from "./external-urls"
import type { PlatformName } from "../types/usage-reports"

dayjs.extend(utc)
const templatesDir = join(process.cwd(), "public", "templates")
const masterTemplatePath = path.join(templatesDir, "master.html")
const headerTemplatePath = path.join(templatesDir, "header.html")
const footerTemplatePath = path.join(templatesDir, "footer.html")
const errorFooterTemplatePath = path.join(templatesDir, "error-report-footer.html")

export const getEnvValue = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

export const currentDateUTC = () => {
  return dayjs().utc().toISOString()
}

// Cache the compiled templates if the service is deployed on a server, instead of serverless
export async function getMasterTemplate() {
  const genericTemplatePath = path.join(templatesDir, "content.html")

  // Load all templates
  const [masterTemplate, contentTemplate, headerTemplate, footerTemplate] = await Promise.all([
    fs.readFile(masterTemplatePath, "utf8"),
    fs.readFile(genericTemplatePath, "utf8"),
    fs.readFile(headerTemplatePath, "utf8"),
    fs.readFile(footerTemplatePath, "utf8")
  ])

  // Register partials
  Handlebars.registerPartial("content", contentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", footerTemplate)

  return Handlebars.compile(masterTemplate)
}

export const getUnsubscribeLink = (email: EmailId) => {
  return `${SETTINGS_URL}/email-preferences?unsubscribe=${email}`
}

export async function getErrorReportTemplate() {
  const errorContentTemplatePath = path.join(templatesDir, "error-report-content.html")

  // Load all templates
  const [masterTemplate, errorContentTemplate, headerTemplate, errorFooterTemplate] =
    await Promise.all([
      fs.readFile(masterTemplatePath, "utf8"),
      fs.readFile(errorContentTemplatePath, "utf8"),
      fs.readFile(headerTemplatePath, "utf8"),
      fs.readFile(errorFooterTemplatePath, "utf8")
    ])

  // Register partials
  Handlebars.registerPartial("content", errorContentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", errorFooterTemplate)

  return Handlebars.compile(masterTemplate)
}

export async function getErrorReportReplyTemplate() {
  const replyContentTemplatePath = path.join(templatesDir, "error-report-reply-content.html")

  // Load all templates
  const [masterTemplate, replyContentTemplate, headerTemplate, errorFooterTemplate] =
    await Promise.all([
      fs.readFile(masterTemplatePath, "utf8"),
      fs.readFile(replyContentTemplatePath, "utf8"),
      fs.readFile(headerTemplatePath, "utf8"),
      fs.readFile(errorFooterTemplatePath, "utf8")
    ])

  // Register partials
  Handlebars.registerPartial("content", replyContentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", errorFooterTemplate)

  return Handlebars.compile(masterTemplate)
}

export async function getInsufficientTokensTemplate() {
  const insufficientTokensContentTemplatePath = path.join(
    templatesDir,
    "insufficient-tokens-content.html"
  )

  // Load all templates
  const [masterTemplate, insufficientTokensContentTemplate, headerTemplate, footerTemplate] =
    await Promise.all([
      fs.readFile(masterTemplatePath, "utf8"),
      fs.readFile(insufficientTokensContentTemplatePath, "utf8"),
      fs.readFile(headerTemplatePath, "utf8"),
      fs.readFile(footerTemplatePath, "utf8")
    ])

  // Register partials
  Handlebars.registerPartial("content", insufficientTokensContentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", footerTemplate)

  return Handlebars.compile(masterTemplate)
}

export async function getPaymentActivationTemplate() {
  const paymentActivationContentTemplatePath = path.join(
    templatesDir,
    "payment-activation-content.html"
  )

  // Load all templates
  const [masterTemplate, paymentActivationContentTemplate, headerTemplate, footerTemplate] =
    await Promise.all([
      fs.readFile(masterTemplatePath, "utf8"),
      fs.readFile(paymentActivationContentTemplatePath, "utf8"),
      fs.readFile(headerTemplatePath, "utf8"),
      fs.readFile(footerTemplatePath, "utf8")
    ])

  // Register partials
  Handlebars.registerPartial("content", paymentActivationContentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", footerTemplate)

  return Handlebars.compile(masterTemplate)
}

export async function getUsageReportTemplate() {
  const usageReportContentTemplatePath = path.join(templatesDir, "usage-report-content.html")

  // Load all templates
  const [masterTemplate, usageReportContentTemplate, headerTemplate, footerTemplate] =
    await Promise.all([
      fs.readFile(masterTemplatePath, "utf8"),
      fs.readFile(usageReportContentTemplatePath, "utf8"),
      fs.readFile(headerTemplatePath, "utf8"),
      fs.readFile(footerTemplatePath, "utf8")
    ])

  // Register partials
  Handlebars.registerPartial("content", usageReportContentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", footerTemplate)

  return Handlebars.compile(masterTemplate)
}

/**
 * Generate a message ID for an error report email.
 * As per RFC 5322, the message ID must be unique.
 * This is used to ensure that replies to the error report email are sent as a reply to the original email.
 * @param botUuid - The UUID of the bot
 * @returns The message ID
 */
export const generateNewErrorReportMessageId = (botUuid: string) =>
  `<error-${botUuid}-message-0@meetingbaas.com>`

export const generateErrorReportReplyMessageId = (botUuid: string, replyNumber: number) =>
  `<error-${botUuid}-message-${replyNumber}@meetingbaas.com>`

// Get the platform from the meeting URL
export const getPlatformFromUrl = (url: string): PlatformName => {
  if (url.includes("zoom.us")) return "zoom"
  if (url.includes("teams.microsoft.com") || url.includes("teams.live.com")) return "teams"
  if (url.includes("meet.google.com")) return "googleMeet"
  return "unknown"
}

// Get the duration string for the usage report
export const getDurationString = (frequency: EmailFrequency, startDate: Date, endDate: Date) => {
  const startDateString = dayjs(startDate).format("D MMM YYYY")
  const endDateString = dayjs(endDate).format("D MMM YYYY")
  switch (frequency) {
    case "Daily":
      return `for today, ${startDateString}`
    case "Weekly":
      return `from ${startDateString} to ${endDateString}`
    case "Monthly":
      return `for the month of ${dayjs(startDate).format("MMMM YYYY")}`
    default:
      return ""
  }
}

// Get the subject for the usage report
export const getSubject = (frequency: EmailFrequency, startDate: Date, endDate: Date) => {
  const subjectPrefix = `${frequency} Usage Report •`
  const startDateString = dayjs(startDate).format("D MMM YYYY")
  const endDateString = dayjs(endDate).format("D MMM YYYY")
  switch (frequency) {
    case "Daily":
      return `${subjectPrefix} ${startDateString}`
    case "Weekly":
      return `${subjectPrefix} ${startDateString} - ${endDateString}`
    case "Monthly":
      return `${subjectPrefix} ${dayjs(startDate).format("MMMM YYYY")}`
    default:
      return ""
  }
}

// Get the duration for the usage report
// The duration is fetched from the previous frequency, not the current one
export const getDuration = (
  frequency: EmailFrequency
): { startDate: Date; endDate: Date } | undefined => {
  switch (frequency) {
    case "Daily":
      return {
        startDate: dayjs().utc().subtract(1, "day").startOf("day").toDate(),
        endDate: dayjs().utc().subtract(1, "day").endOf("day").toDate()
      }
    case "Weekly":
      return {
        startDate: dayjs().utc().subtract(1, "week").startOf("week").toDate(),
        endDate: dayjs().utc().subtract(1, "week").endOf("week").toDate()
      }
    case "Monthly":
      return {
        startDate: dayjs().utc().subtract(1, "month").startOf("month").toDate(),
        endDate: dayjs().utc().subtract(1, "month").endOf("month").toDate()
      }
  }
}

// Helper function to format a number to 2 decimal places
export function formatNumber(number: number): string {
  return (Math.round(number * 100) / 100).toFixed(2)
}
