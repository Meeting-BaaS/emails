import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./src/database/migrations",
  schema: "./src/database/migrations/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})
