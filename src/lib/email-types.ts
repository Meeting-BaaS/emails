import type { EmailType } from "../types/email-types"

export const emailTypes: EmailType[] = [
  {
    id: "usage-reports",
    name: "Usage Reports",
    domain: "reports",
    required: false,
    defaultFrequency: "Weekly"
  },
  {
    id: "activity-updates",
    name: "Activity Updates",
    domain: "reports",
    required: false,
    broadcast: true,
    defaultFrequency: "Weekly"
  },
  {
    id: "product-updates",
    name: "Product Updates",
    domain: "announcements",
    required: false,
    broadcast: true,
    defaultFrequency: "Daily"
  },
  {
    id: "maintenance",
    name: "Maintenance Notifications",
    domain: "announcements",
    required: true,
    broadcast: true,
    defaultFrequency: "Weekly"
  },
  {
    id: "company-news",
    name: "Company News",
    domain: "announcements",
    required: false,
    broadcast: true,
    defaultFrequency: "Weekly"
  },
  {
    id: "api-changes",
    name: "API Changes",
    domain: "developers",
    required: false,
    broadcast: true,
    defaultFrequency: "Weekly"
  },
  {
    id: "developer-resources",
    name: "Developer Resources",
    domain: "developers",
    required: false,
    broadcast: true,
    defaultFrequency: "Weekly"
  },
  {
    id: "security",
    name: "Security Alerts",
    domain: "account",
    required: true,
    defaultFrequency: "Weekly"
  },
  {
    id: "billing",
    name: "Billing Notifications",
    domain: "account",
    required: true,
    defaultFrequency: "Weekly"
  }
]
