import { type CreateEmailResponseSuccess, Resend } from "resend"
import { getEnvValue } from "./utils"
import { logger } from "./logger"

const resend = new Resend(getEnvValue("RESEND_API_KEY"))

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async ({
  to,
  subject,
  html
}: SendEmailOptions): Promise<CreateEmailResponseSuccess> => {
  logger.debug(`Sending email to ${to} with subject ${subject}`)
  const { data, error } = await resend.emails.send({
    from: getEnvValue("RESEND_EMAIL_FROM"),
    to,
    subject,
    html
  })

  if (error) {
    logger.error(`Error sending email: ${error.message}`)
    throw new Error(error.message)
  }

  if (!data) {
    logger.error("No data returned from Resend")
    throw new Error("No data returned from Resend")
  }

  return data
}

interface SendNewErrorReportEmailOptions {
  to: string
  subject: string
  html: string
  cc?: string | string[]
  messageId: string
}

export const sendNewErrorReportEmail = async ({
  to,
  subject,
  html,
  cc,
  messageId
}: SendNewErrorReportEmailOptions): Promise<CreateEmailResponseSuccess> => {
  logger.debug(`Sending new error report email to ${to} with subject ${subject}`)
  const { data, error } = await resend.emails.send({
    from: getEnvValue("RESEND_EMAIL_FROM"),
    to,
    subject,
    html,
    cc,
    headers: {
      "Message-ID": messageId,
      References: messageId
    }
  })

  if (error) {
    logger.error(`Error sending new error report email: ${error.message}`)
    throw new Error(error.message)
  }

  if (!data) {
    logger.error("No data returned from Resend for new error report email")
    throw new Error("No data returned from Resend for new error report email")
  }

  return data
}

interface SendErrorReportReplyEmailOptions {
  to: string
  subject: string
  html: string
  cc?: string | string[]
  messageId: string
  references: string[]
}
export const sendErrorReportReplyEmail = async ({
  to,
  subject,
  html,
  cc,
  messageId,
  references
}: SendErrorReportReplyEmailOptions): Promise<CreateEmailResponseSuccess> => {
  logger.debug(`Sending error report reply email to ${to} with subject ${subject}`)
  const { data, error } = await resend.emails.send({
    from: getEnvValue("RESEND_EMAIL_FROM"),
    to,
    subject,
    html,
    cc,
    headers: {
      "Message-ID": messageId,
      References: references.join(" ")
    }
  })

  console.log(messageId, references)

  if (error) {
    logger.error(`Error sending error report reply email: ${error.message}`)
    throw new Error(error.message)
  }

  if (!data) {
    logger.error("No data returned from Resend for error report reply email")
    throw new Error("No data returned from Resend for error report reply email")
  }

  return data
}
