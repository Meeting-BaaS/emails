import type { AppContext } from "../../types/context"
import { db } from "../../lib/db"
import { emailContent } from "../../database/migrations/schema"
import { logger } from "../../lib/logger"
import { UNKNOWN_ERROR } from "../../lib/constants"
import { z } from "zod"
import { saveContentSchema } from "../../schemas/admin"
import sanitizeHtml from "sanitize-html"
import type { emailType } from "../../database/migrations/schema"

type EmailType = (typeof emailType.enumValues)[number]

export async function saveContent(c: AppContext) {
  try {
    const user = c.get("user")
    const { id: accountId } = user
    const body = await c.req.json()
    const { emailType, content } = saveContentSchema.parse(body)

    logger.debug("Saving email content", { emailType })

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content)

    // Create new content
    await db.insert(emailContent).values({
      emailType: emailType as EmailType,
      content: sanitizedContent,
      accountId
    })

    logger.debug("Created new email content", { emailType })

    return c.json(
      {
        success: true,
        message: "Email content saved successfully"
      },
      201
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("Invalid request body", { errors: error.errors })
      return c.json(
        {
          success: false,
          message: "Invalid request body",
          errors: error.errors
        },
        400
      )
    }

    logger.error(
      `Error saving email content: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`
    )

    return c.json(
      {
        success: false,
        message: "Failed to save email content"
      },
      500
    )
  }
}
