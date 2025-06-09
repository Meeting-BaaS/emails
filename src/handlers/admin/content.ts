import type { AppContext } from "../../types/context"
import { db } from "../../lib/db"
import { emailContent, accounts } from "../../database/migrations/schema"
import { logger } from "../../lib/logger"
import { UNKNOWN_ERROR } from "../../lib/constants"
import { z } from "zod"
import { saveContentSchema } from "../../schemas/admin"
import sanitizeHtml from "sanitize-html"
import type { emailType } from "../../database/migrations/schema"
import { currentDateUTC } from "../../lib/utils"
import { desc, eq } from "drizzle-orm"

type EmailType = (typeof emailType.enumValues)[number]

export async function getContents(c: AppContext) {
  try {
    const contents = await db
      .select({
        id: emailContent.id,
        emailType: emailContent.emailType,
        content: emailContent.content,
        contentText: emailContent.contentText,
        createdAt: emailContent.createdAt,
        accountId: emailContent.accountId,
        name: accounts.fullName
      })
      .from(emailContent)
      .innerJoin(accounts, eq(emailContent.accountId, accounts.id))
      .orderBy(desc(emailContent.createdAt))

    return c.json({
      success: true,
      data: contents
    })
  } catch (error) {
    logger.error(`Error fetching contents: ${error instanceof Error ? error.stack : UNKNOWN_ERROR}`)

    return c.json(
      {
        success: false,
        message: "Failed to fetch contents"
      },
      500
    )
  }
}

export async function saveContent(c: AppContext) {
  try {
    const user = c.get("user")
    const { id: accountId } = user
    const body = await c.req.json()
    const { emailType, content, contentText } = saveContentSchema.parse(body)

    logger.debug("Saving email content", { emailType })

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content)

    const createdAt = currentDateUTC()

    // Create new content
    await db.insert(emailContent).values({
      emailType: emailType as EmailType,
      content: sanitizedContent,
      contentText,
      accountId,
      createdAt
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
