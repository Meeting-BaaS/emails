import {
  type CreateBatchOptions,
  type CreateBatchSuccessResponse,
  type CreateEmailResponseSuccess,
  Resend
} from "resend"
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

export const sendBatchEmails = async (
  emails: CreateBatchOptions
): Promise<CreateBatchSuccessResponse["data"]> => {
  logger.debug(`Sending batch email to ${emails.length} recipients`)
  const { data, error } = await resend.batch.send(emails)

  if (error) {
    logger.error(`Error sending batch email: ${error.message}`)
    throw new Error(error.message)
  }

  if (!data) {
    logger.error("No data returned from Resend for batch email")
    throw new Error("No data returned from Resend for batch email")
  }

  return data.data
}

interface SendErrorReportEmailOptions {
  to: string
  subject: string
  html: string
  cc?: string | string[]
  messageId: string
  references?: string[]
}

export const sendErrorReportEmail = async ({
  to,
  subject,
  html,
  cc,
  messageId,
  references
}: SendErrorReportEmailOptions): Promise<CreateEmailResponseSuccess> => {
  logger.debug(`Sending error report email to ${to} with subject ${subject}`)
  const { data, error } = await resend.emails.send({
    from: getEnvValue("RESEND_EMAIL_FROM"),
    to,
    subject,
    html,
    cc,
    headers: {
      "Message-ID": messageId,
      References: references?.join(" ") || messageId
    }
  })

  if (error) {
    logger.error(`Error sending error report email: ${error.message}`)
    throw new Error(error.message)
  }

  if (!data) {
    logger.error("No data returned from Resend for error report email")
    throw new Error("No data returned from Resend for error report email")
  }

  return data
}
