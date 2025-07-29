import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export const PostOrderReviewSchema = z.object({
  product_id: z.string(),
  title: z.string().optional(),
  content: z.string().min(10, "Review content must be at least 10 characters"),
  rating: z.number().min(1).max(5),
  first_name: z.string(),
  last_name: z.string()
})

type PostOrderReviewReq = z.infer<typeof PostOrderReviewSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostOrderReviewReq>,
  res: MedusaResponse
) => {
  const { order_id } = req.params
  const input = PostOrderReviewSchema.parse(req.body)
  const customerId = req.auth_context?.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  if (!customerId) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    // Validate that customer owns the order
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id", "status", "items.*", "fulfillments.*", "fulfillments.delivered_at"],
      filters: { 
        id: order_id,
        customer_id: customerId
      }
    })

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "Order not found or access denied" })
    }

    const order = orders[0]

    // Check if order has been delivered
    const hasDeliveredFulfillment = order.fulfillments?.some(fulfillment => fulfillment.delivered_at)
    if (!hasDeliveredFulfillment) {
      return res.status(400).json({ error: "Only delivered orders can be reviewed" })
    }

    // Check if customer purchased this product in this order
    const productInOrder = order.items?.some(item => item.product_id === input.product_id)
    if (!productInOrder) {
      return res.status(400).json({ error: "Product not found in this order" })
    }

    // Check if review already exists for this order-product combination
    const { data: existingReviews } = await query.graph({
      entity: "review",
      fields: ["id"],
      filters: {
        order_id: order_id,
        product_id: input.product_id
      }
    })

    if (existingReviews && existingReviews.length > 0) {
      return res.status(400).json({ error: "Review already exists for this product in this order" })
    }

    // Get product data to auto-assign collection
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "collection_id"],
      filters: { id: input.product_id }
    })

    const product = products?.[0]
    if (!product) {
      return res.status(400).json({ error: "Product not found" })
    }

    // Auto-assign collection (use product's collection_id)
    const collectionId = product.collection_id || null

    // Create review using the query service
    const reviewData = {
      ...input,
      order_id: order_id,
      customer_id: customerId,
      collection_id: collectionId,
      status: "pending"
    }

    // Create review using module service
    const reviewModuleService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
    const createdReview = await reviewModuleService.createReviews([reviewData])

    res.status(201).json({
      review: createdReview[0],
      message: "Review submitted successfully and is pending approval"
    })

  } catch (error) {
    console.error("Error creating review:", error)
    res.status(500).json({ 
      error: "Failed to create review",
      details: error.message 
    })
  }
}