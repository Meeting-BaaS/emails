import Stripe from "stripe"
import { getEnvValue } from "./utils"
import type { TokenPack, StripeProductWithPrice } from "../types/token-pack"
import { DEFAULT_RECORDING_RATE } from "./constants"

const stripeKey = getEnvValue("STRIPE_API_KEY")
const stripe = new Stripe(stripeKey)

const starterPackProductId = getEnvValue("STRIPE_STARTER_PACK_PRODUCT_ID")
const proPackProductId = getEnvValue("STRIPE_PRO_PACK_PRODUCT_ID")
const businessPackProductId = getEnvValue("STRIPE_BUSINESS_PACK_PRODUCT_ID")
const enterprisePackProductId = getEnvValue("STRIPE_ENTERPRISE_PACK_PRODUCT_ID")

export const fetchAllProducts = async (): Promise<StripeProductWithPrice[]> => {
  const products = await stripe.products.list({
    ids: [starterPackProductId, proPackProductId, businessPackProductId, enterprisePackProductId]
  })

  const retrievedProducts: StripeProductWithPrice[] = await Promise.all(
    products.data.map(async (product: Stripe.Product) => {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true
      })
      const price = prices.data[0]
      return {
        ...product,
        price
      }
    })
  )

  return retrievedProducts
}

// Helper functions
export function formatTokenBalance(tokenBalance: number): string {
  return (Math.round(tokenBalance * 100) / 100).toFixed(2)
}

function calculateRecordingHours(tokens: number, rate: number): number {
  if (rate > 0) {
    return Math.round((tokens / rate) * 100) / 100
  }
  return 0
}

function calculatePricePerHour(tokens: number, price: number, rate: number): number {
  if (rate > 0) {
    const hours = tokens / rate
    const pricePerHour = price / hours
    return Math.round(pricePerHour * 100) / 100
  }
  return 0
}

export function formatProductsToTokenPacks(products: StripeProductWithPrice[]): TokenPack[] {
  return products.map((product) => {
    const price = product.price.unit_amount ? product.price.unit_amount / 100 : 0
    const tokens =
      product.metadata.tokens && !Number.isNaN(Number(product.metadata.tokens))
        ? Number(product.metadata.tokens)
        : 0
    const recordingRate = Number(DEFAULT_RECORDING_RATE)
    return {
      name: product.name,
      tokens,
      price,
      recordingHours: calculateRecordingHours(tokens, recordingRate),
      pricePerHour: calculatePricePerHour(tokens, price, recordingRate),
      isPopular: product.id === proPackProductId // Pro Pack is the most popular pack
    }
  })
}
