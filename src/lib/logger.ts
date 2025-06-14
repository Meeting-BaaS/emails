import { pino } from "pino"

const isDevelopment = process.env.NODE_ENV !== "production"

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(isDevelopment
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l",
            ignore: "pid,hostname"
          }
        }
      }
    : {})
})
