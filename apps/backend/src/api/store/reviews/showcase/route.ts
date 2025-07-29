import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
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
  minRating: z.preprocess(
    (val) => val ? parseInt(val as string) : 1,
    z.number().min(1).max(5).default(1)
  )
})

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { limit, offset, minRating } = GetStoreReviewsShowcaseSchema.parse(req.query)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const filters: any = {
      status: "approved"
    }

    if (minRating > 1) {
      filters.rating = { $gte: minRating }
    }

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
        "created_at",
        "updated_at"
      ],
      filters,
      pagination: {
        take: limit,
        skip: offset
      },
      order: { created_at: "DESC" }
    })

    res.json({
      reviews,
      count,
      limit: take || limit,
      offset: skip || offset,
      average_rating: 0 // We could calculate this if needed
    })
  } catch (error) {
    console.error("Error fetching showcase reviews:", error)
    res.status(500).json({ error: "Failed to fetch showcase reviews", details: error.message })
  }
}