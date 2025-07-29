import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

export const GetReviewableOrdersSchema = z.object({
  limit: z.preprocess(
    (val) => val ? parseInt(val as string) : 20,
    z.number().min(1).max(100).default(20)
  ),
  offset: z.preprocess(
    (val) => val ? parseInt(val as string) : 0,
    z.number().min(0).default(0)
  )
})

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { limit, offset } = GetReviewableOrdersSchema.parse(req.query)
  const customerId = req.auth_context?.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  if (!customerId) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    // Get customer's completed orders with fulfillments
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id", 
        "status",
        "created_at",
        "items.*",
        "items.product_id",
        "items.variant.product.*",
        "fulfillments.*",
        "fulfillments.delivered_at"
      ],
      filters: {
        customer_id: customerId
        // Don't filter by order status - we'll check fulfillment delivery status instead
      },
      pagination: {
        take: limit,
        skip: offset
      },
      order: { created_at: "DESC" }
    })

    if (!orders || orders.length === 0) {
      return res.json({
        orders: [],
        count: 0,
        limit,
        offset
      })
    }

    // Get existing reviews to filter out already reviewed orders
    const { data: existingReviews } = await query.graph({
      entity: "review",
      fields: ["order_id", "product_id"],
      filters: {
        customer_id: customerId
      }
    })

    const reviewedOrderProductMap = new Set(
      existingReviews?.map(review => `${review.order_id}-${review.product_id}`) || []
    )

    // Filter orders and add reviewable status for each item
    const reviewableOrders = orders
      .filter(order => {
        // Only include orders that have been delivered (have fulfillments with delivered_at)
        const hasDeliveredFulfillment = order.fulfillments?.some(fulfillment => fulfillment.delivered_at)
        
        return hasDeliveredFulfillment
      })
      .map(order => ({
        ...order,
        items: order.items?.map(item => ({
          ...item,
          can_review: !reviewedOrderProductMap.has(`${order.id}-${item.product_id}`)
        })) || []
      })).filter(order => 
        // Only include orders that have at least one reviewable item
        order.items?.some(item => item.can_review)
      )

    res.json({
      orders: reviewableOrders,
      count: reviewableOrders.length,
      limit,
      offset
    })

  } catch (error) {
    console.error("Error fetching reviewable orders:", error)
    res.status(500).json({ 
      error: "Failed to fetch reviewable orders",
      details: error.message 
    })
  }
}