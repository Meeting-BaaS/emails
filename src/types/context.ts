import type { Context } from "hono"
import type { User } from "./session"

export type AppContext = Context<{ Variables: { user: User } }>
