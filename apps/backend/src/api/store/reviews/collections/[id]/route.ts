import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"
import { z } from "zod"

export const GetCollectionReviewsSchema = z.object({
  limit: z.preprocess(
    (val) => val ? parseInt(val as string) : 20,
    z.number().min(1).max(100).default(20)
  ),
  offset: z.preprocess(
    (val) => val ? parseInt(val as string) : 0,
    z.number().min(0).default(0)
  ),
})

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const { limit, offset } = GetCollectionReviewsSchema.parse(req.query)
  
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reviewModuleService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)

  try {
    // Get reviews for collection directly
    const { data: reviews, metadata: {
      count,
      take,
      skip
    } = { count: 0, take: limit, skip: offset } } = await query.graph({
      entity: "review",
      fields: [
        "id",
        "title",
        "content", 
        "rating",
        "first_name",
        "last_name",
        "product_id",
        "collection_id",
        "created_at",
        "updated_at"
      ],
      filters: {
        collection_id: id,
        status: "approved"
      },
      pagination: {
        take: limit,
        skip: offset
      }
    })

    const averageRating = await reviewModuleService.getCollectionAverageRating(id)

    res.json({
      reviews,
      count,
      limit: take || limit,
      offset: skip || offset,
      average_rating: averageRating
    })
  } catch (error) {
    console.error("Error fetching collection reviews:", error)
    res.status(500).json({ error: "Failed to fetch collection reviews", details: error.message })
  }
}