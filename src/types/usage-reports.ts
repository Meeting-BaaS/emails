export type PlatformName = "googleMeet" | "zoom" | "teams" | "unknown"

export type BotsData = {
  meetingUrls: string[]
  errors: string[]
  totalBots: number
  avgLength: number
  totalHours: number
  recordingTokens: number
  transcriptionTokens: number
  errorCount: number
  totalCount: number
  accountId?: number
}

export type UserStats = {
  accountId: number
  totalBots: number
  avgLength: number
  platformStats: {
    googleMeet: { value: number; success: number }
    zoom: { value: number; success: number }
    teams: { value: number; success: number }
  }
  hours: {
    recording: number
    transcription: number
  }
  tokens: {
    recording: number
    transcription: number
  }
  errorRate: number
}
