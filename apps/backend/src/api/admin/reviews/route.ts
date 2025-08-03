import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

export const GetAdminReviewsSchema = z.object({
  limit: z.preprocess(
    (val) => val ? parseInt(val as string) : 15,
    z.number().min(1).max(100).default(15)
  ),
  offset: z.preprocess(
    (val) => val ? parseInt(val as string) : 0,
    z.number().min(0).default(0)
  ),
  order: z.string().optional().default("-created_at")
})

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { limit, offset, order } = GetAdminReviewsSchema.parse(req.query)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // Query the review table directly using the query service
    const result = await query.graph({
      entity: "review",
      fields: [
        "id",
        "title", 
        "content",
        "rating",
        "status",
        "first_name",
        "last_name",
        "product_id",
        "customer_id",
        "order_id",
        "created_at",
        "updated_at"
      ],
      pagination: {
        take: limit,
        skip: offset
      }
    })

    res.json({
      reviews: result.data || [],
      count: result.metadata?.count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    res.status(500).json({ error: "Failed to fetch reviews", details: error.message })
  }
}