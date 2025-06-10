import fs from "node:fs/promises"
import path, { join } from "node:path"
import Handlebars from "handlebars"
import type { EmailId } from "../types/email-types"
import dayjs from "dayjs"
import { SETTINGS_URL } from "./external-urls"

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

export async function getMasterTemplate() {
  const templatesDir = join(process.cwd(), "public", "templates")

  // Load all templates
  const [masterTemplate, contentTemplate, headerTemplate, footerTemplate] = await Promise.all([
    fs.readFile(path.join(templatesDir, "master.html"), "utf8"),
    fs.readFile(path.join(templatesDir, "content.html"), "utf8"),
    fs.readFile(path.join(templatesDir, "header.html"), "utf8"),
    fs.readFile(path.join(templatesDir, "footer.html"), "utf8")
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
  const templatesDir = join(process.cwd(), "public", "templates")

  // Load all templates
  const [masterTemplate, errorContentTemplate, headerTemplate, errorFooterTemplate] =
    await Promise.all([
      fs.readFile(path.join(templatesDir, "master.html"), "utf8"),
      fs.readFile(path.join(templatesDir, "error-report-content.html"), "utf8"),
      fs.readFile(path.join(templatesDir, "header.html"), "utf8"),
      fs.readFile(path.join(templatesDir, "error-report-footer.html"), "utf8")
    ])

  // Register partials
  Handlebars.registerPartial("content", errorContentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", errorFooterTemplate)

  return Handlebars.compile(masterTemplate)
}

export async function getErrorReportReplyTemplate() {
  const templatesDir = join(process.cwd(), "public", "templates")

  // Load all templates
  const [masterTemplate, errorContentTemplate, headerTemplate, errorFooterTemplate] =
    await Promise.all([
      fs.readFile(path.join(templatesDir, "master.html"), "utf8"),
      fs.readFile(path.join(templatesDir, "error-report-reply-content.html"), "utf8"),
      fs.readFile(path.join(templatesDir, "header.html"), "utf8"),
      fs.readFile(path.join(templatesDir, "error-report-footer.html"), "utf8")
    ])

  // Register partials
  Handlebars.registerPartial("content", errorContentTemplate)
  Handlebars.registerPartial("header", headerTemplate)
  Handlebars.registerPartial("footer", errorFooterTemplate)

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
