import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const reviewModuleService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)

  try {
    const reviews = await reviewModuleService.getReviewsByCollection(id)
    const averageRating = await reviewModuleService.getCollectionAverageRating(id)

    res.json({
      reviews: reviews.data,
      meta: reviews.metadata,
      average_rating: averageRating,
      total_reviews: reviews.metadata?.count || 0
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch collection reviews" })
  }
}