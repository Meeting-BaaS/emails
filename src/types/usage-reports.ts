export type PlatformName = "googleMeet" | "zoom" | "teams" | "unknown"

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
