import { StorePrice } from "@medusajs/types"

export type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

export type VariantPrice = {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: string
  percentage_diff: string
}

export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

export type ProductReview = {
  id: string
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  status: "pending" | "approved" | "rejected"
  product_id: string
  customer_id?: string
  created_at: string
  updated_at: string
}

export type ReviewsResponse = {
  reviews: ProductReview[]
  count: number
  limit: number
  offset: number
  average_rating: number
  business_stats?: {
    overall_rating: number
    total_reviews: number
  }
}
