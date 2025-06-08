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
