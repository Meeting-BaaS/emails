import fs from "node:fs/promises"
import path, { join } from "node:path"
import Handlebars from "handlebars"
import type { EmailId } from "../types/email-types"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { SETTINGS_URL } from "./external-urls"

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
