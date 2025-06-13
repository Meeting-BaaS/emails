// Meeting BaaS environment prefix for app URLs. For lower environments, it would be something like pre-prod-
// It would be empty for prod.
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || ""

// Define base domain
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "meetingbaas.com"

// Helper to construct environment-aware URLs
const createUrl = (subdomain: string) => {
  if (environment) {
    return `https://${subdomain}.${environment}${BASE_DOMAIN}`
  }
  return `https://${subdomain}.${BASE_DOMAIN}`
}

// Settings App
export const SETTINGS_URL = createUrl("settings")
export const AI_CHAT_URL = createUrl("chat")
export const LOGS_URL = createUrl("logs")
export const BILLING_URL = `${createUrl("pricing")}/billing`
