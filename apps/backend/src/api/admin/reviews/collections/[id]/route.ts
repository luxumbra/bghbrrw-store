import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const reviewModuleService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)

  try {
    // Get all reviews for collection (including pending/rejected for admin)
    const reviews = await reviewModuleService.listReviews({
      collection_id: id
    })
    const averageRating = await reviewModuleService.getCollectionAverageRating(id)

    res.json({
      reviews: reviews,
      meta: { count: reviews.length },
      average_rating: averageRating,
      total_reviews: reviews.length
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch collection reviews" })
  }
}

export const POST = async (
  req: AuthenticatedMedusaRequest<{ review_id: string }>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const { review_id } = req.body
  const reviewModuleService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)

  try {
    const link = await reviewModuleService.linkReviewToCollection(review_id, id)
    res.json({ link })
  } catch (error) {
    res.status(500).json({ error: "Failed to link review to collection" })
  }
}