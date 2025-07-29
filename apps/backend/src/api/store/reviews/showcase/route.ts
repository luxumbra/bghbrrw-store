import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review"
import ProductReviewModuleService from "../../../../modules/product-review/service"
import { z } from "zod"

export const GetStoreReviewsShowcaseSchema = z.object({
  limit: z.preprocess(
    (val) => val ? parseInt(val as string) : 10,
    z.number().min(1).max(50).default(10)
  ),
  offset: z.preprocess(
    (val) => val ? parseInt(val as string) : 0,
    z.number().min(0).default(0)
  ),
  min_rating: z.preprocess(
    (val) => val ? parseInt(val as string) : undefined,
    z.number().min(1).max(5).optional()
  )
})

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const reviewModuleService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const { limit, offset, min_rating } = GetStoreReviewsShowcaseSchema.parse(req.query)

  try {
    const filters: any = {
      status: "approved"
    }

    if (min_rating) {
      filters.rating = { $gte: min_rating }
    }

    const reviews = await reviewModuleService.listReviews(
      filters,
      {
        take: limit,
        skip: offset,
        order: { created_at: "DESC" }
      }
    )

    res.json({
      reviews: reviews.data,
      meta: {
        ...reviews.metadata,
        limit,
        offset
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch showcase reviews" })
  }
}