import { db } from "./db"
import { emailPreferences } from "../database/migrations/schema"
import { and, eq } from "drizzle-orm"
import type { EmailType } from "../types/email-types"

export async function isUnsubscribed(accountId: number, emailType: EmailType["id"]) {
  const isSubscribed = await db
    .select({
      id: emailPreferences.id,
      frequency: emailPreferences.frequency
    })
    .from(emailPreferences)
    .where(
      and(eq(emailPreferences.accountId, accountId), eq(emailPreferences.emailType, emailType))
    )
    .limit(1)

  return isSubscribed.length === 0 || isSubscribed[0].frequency.toLowerCase() === "never"
}
