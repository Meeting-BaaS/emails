import type { Context } from "hono"
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const faviconHandler = (c: Context) => {
  const faviconPath = join(process.cwd(), "public", "favicon.ico")
  const favicon = readFileSync(faviconPath)
  return c.body(favicon, {
    headers: {
      "Content-Type": "image/x-icon"
    }
  })
}
