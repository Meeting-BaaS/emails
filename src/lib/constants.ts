export const UNKNOWN_ERROR = "Unknown error"

// Template variables
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@meetingbaas.com"
export const SYSTEM_MESSAGE =
  "This is an automated service notification for your Meeting BaaS account. For immediate assistance, please contact our support team."

// Error Report subject
export const ERROR_REPORT_SUBJECT = "Error Report Received"

// Disable cool down for system emails
export const DISABLE_COOLDOWN_FOR_SYSTEM_EMAILS =
  process.env.DISABLE_COOLDOWN_FOR_SYSTEM_EMAILS === "true"

// Insufficient tokens email
export const INSUFFICIENT_TOKENS_COOLDOWN = 24
export const DEFAULT_RECORDING_RATE = "1.00"
export const DEFAULT_TRANSCRIPTION_RATE = "+0.25"
export const DEFAULT_STREAMING_OUTPUT_RATE = "+0.10"

// Payment activation email
export const PAYMENT_ACTIVATION_COOLDOWN = 24

// Usage reports cron job batch size. Maximum batch size for Resend is 100. 80 is a safe number
export const USAGE_REPORTS_BATCH_SIZE = 80

// Trigger usage reports cron jobs
export const TRIGGER_USAGE_REPORTS_CRON_JOBS =
  process.env.TRIGGER_USAGE_REPORTS_CRON_JOBS === "true"
