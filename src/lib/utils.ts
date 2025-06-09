import fs from "node:fs/promises"
import path, { join } from "node:path"
import Handlebars from "handlebars"
import type { EmailId } from "../types/email-types"
import dayjs from "dayjs"

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
  const settingsUrl = process.env.SETTINGS_APP_URL || "https://settings.meetingbaas.com"
  return `${settingsUrl}/email-preferences?unsubscribe=${email}`
}
