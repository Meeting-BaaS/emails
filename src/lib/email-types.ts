import type { EmailType } from "../types/email-types"

export const emailTypes: EmailType[] = [
  {
    id: "usage-reports",
    name: "Usage Reports",
    domain: "Reports",
    required: false
  },
  {
    id: "product-updates",
    name: "Product Updates",
    domain: "Announcements",
    required: false,
    broadcast: true
  },
  {
    id: "maintenance",
    name: "Maintenance Notifications",
    domain: "Announcements",
    required: true,
    broadcast: true
  },
  {
    id: "company-news",
    name: "Company News",
    domain: "Announcements",
    required: false,
    broadcast: true
  },
  {
    id: "api-changes",
    name: "API Changes",
    domain: "Developers",
    required: false,
    broadcast: true
  },
  {
    id: "developer-resources",
    name: "Developer Resources",
    domain: "Developers",
    required: false,
    broadcast: true
  },
  {
    id: "security",
    name: "Security Alerts",
    domain: "Account",
    required: true
  },
  {
    id: "billing",
    name: "Billing Notifications",
    domain: "Account",
    required: true
  }
]
