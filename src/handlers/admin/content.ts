import type { AppContext } from "../../types/context"
import { db } from "../../lib/db"
import { emailContent, accounts } from "../../database/migrations/schema"
import { logger } from "../../lib/logger"
import { UNKNOWN_ERROR } from "../../lib/constants"
import { z } from "zod"
import { saveContentSchema, updateContentSchema, deleteContentSchema } from "../../schemas/admin"
import sanitizeHtml from "sanitize-html"
import { currentDateUTC } from "../../lib/utils"
import { desc, eq } from "drizzle-orm"
import type { EmailType } from "../../types/email-types"

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
    logger.error(
      `Error fetching contents: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )

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

    if (!sanitizedContent.trim()) {
      logger.error("Content cannot be empty after sanitisation")
      return c.json(
        {
          success: false,
          message: "Content cannot be empty after sanitisation"
        },
        400
      )
    }

    const createdAt = currentDateUTC()

    // Create new content
    await db.insert(emailContent).values({
      emailType: emailType as EmailType["id"],
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
      `Error saving email content: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
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

export async function updateContent(c: AppContext) {
  try {
    const user = c.get("user")
    const { id: accountId } = user
    const body = await c.req.json()
    const { id, emailType, content, contentText } = updateContentSchema.parse(body)

    logger.debug("Updating email content", { id, emailType })

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content)

    if (!sanitizedContent.trim()) {
      logger.error("Content cannot be empty after sanitisation")
      return c.json(
        {
          success: false,
          message: "Content cannot be empty after sanitisation"
        },
        400
      )
    }

    const createdAt = currentDateUTC()

    // Update content
    const result = await db
      .update(emailContent)
      .set({
        emailType: emailType as EmailType["id"],
        content: sanitizedContent,
        contentText,
        createdAt,
        accountId
      })
      .where(eq(emailContent.id, id))

    if (result.rowCount === 0) {
      logger.error("Content not found", { id })
      return c.json(
        {
          success: false,
          message: "Content not found"
        },
        404
      )
    }

    logger.debug("Updated email content", { id, emailType })

    return c.json({
      success: true,
      message: "Email content updated successfully"
    })
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
      `Error updating email content: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )

    return c.json(
      {
        success: false,
        message: "Failed to update email content"
      },
      500
    )
  }
}

export async function deleteContent(c: AppContext) {
  try {
    const user = c.get("user")
    const { id } = deleteContentSchema.parse(c.req.param())

    logger.debug("Deleting email content", { id })

    // Delete content
    const result = await db.delete(emailContent).where(eq(emailContent.id, id))

    if (result.rowCount === 0) {
      logger.error("Content not found", { id })
      return c.json(
        {
          success: false,
          message: "Content not found"
        },
        404
      )
    }

    logger.debug("Deleted email content", { id })

    return c.json({
      success: true,
      message: "Email content deleted successfully"
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("Invalid request parameters", { errors: error.errors })
      return c.json(
        {
          success: false,
          message: "Invalid request parameters",
          errors: error.errors
        },
        400
      )
    }

    logger.error(
      `Error deleting email content: ${error instanceof Error ? error.stack || error.message : UNKNOWN_ERROR}`
    )

    return c.json(
      {
        success: false,
        message: "Failed to delete email content"
      },
      500
    )
  }
}
