import { ExecArgs } from "@medusajs/framework/types"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import ProductReviewModuleService from "../modules/product-review/service"

export default async function testReviews({ container }: ExecArgs) {
  const reviewModuleService: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

  try {
    console.log("Testing review module service...")
    
    const reviews = await reviewModuleService.listReviews({}, { take: 5 })
    
    console.log(`Found ${reviews.length || 0} reviews`)
    console.log("Sample review:", reviews[0])
    console.log("Reviews array:", reviews)
    
  } catch (error) {
    console.error("Error testing reviews:", error)
  }
}

export const config = {
  name: "test-reviews",
  alias: "tr"
}