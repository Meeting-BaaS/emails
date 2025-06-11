export type EmailFrequency = "Daily" | "Weekly" | "Monthly" | "Never"

export type EmailTypeDomain = "reports" | "announcements" | "developers" | "account"

export type EmailId =
  // Legacy email types
  | "insufficient_tokens_recording"
  | "payment_activation"
  | "usage_report"
  | "welcome"
  // New email types
  | "usage-reports"
  | "activity-updates"
  | "error-report"
  | "product-updates"
  | "maintenance"
  | "company-news"
  | "api-changes"
  | "developer-resources"
  | "security"
  | "billing"
  | "custom"

export type EmailType = {
  id: EmailId
  name: string
  domain: EmailTypeDomain
  required: boolean
  broadcast?: boolean
  defaultFrequency: EmailFrequency
}
