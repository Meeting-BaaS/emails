import type { EmailType } from "../types/email-types"

export const emailTypes: EmailType[] = [
  {
    id: "usage-reports",
    name: "Usage Reports",
    domain: "reports",
    required: false
  },
  {
    id: "product-updates",
    name: "Product Updates",
    domain: "announcements",
    required: false,
    broadcast: true
  },
  {
    id: "maintenance",
    name: "Maintenance Notifications",
    domain: "announcements",
    required: true,
    broadcast: true
  },
  {
    id: "company-news",
    name: "Company News",
    domain: "announcements",
    required: false,
    broadcast: true
  },
  {
    id: "api-changes",
    name: "API Changes",
    domain: "developers",
    required: false,
    broadcast: true
  },
  {
    id: "developer-resources",
    name: "Developer Resources",
    domain: "developers",
    required: false,
    broadcast: true
  },
  {
    id: "security",
    name: "Security Alerts",
    domain: "account",
    required: true
  },
  {
    id: "billing",
    name: "Billing Notifications",
    domain: "account",
    required: true
  }
]
