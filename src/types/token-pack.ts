import type Stripe from "stripe"

export interface TokenPack {
  name: string
  tokens: number
  price: number
  recordingHours: number
  pricePerHour: number
  isPopular: boolean
}

export type StripeProductWithPrice = Stripe.Product & { price: Stripe.Price }
