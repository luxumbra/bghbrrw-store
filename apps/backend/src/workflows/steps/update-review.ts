import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

export type UpdateReviewStepInput = {
  id: string
  status?: "pending" | "approved" | "rejected"
  title?: string
  content?: string
  rating?: number
}

export const updateReviewStep = createStep(
  "update-review",
  async (input: UpdateReviewStepInput, { container }) => {
    const reviewModuleService: ProductReviewModuleService = container.resolve(
      PRODUCT_REVIEW_MODULE
    )

    // Store original values for compensation
    const originalReview = await reviewModuleService.retrieveReview(input.id)
    
    const updatedReview = await reviewModuleService.updateReviews(input.id, {
      status: input.status,
      title: input.title,
      content: input.content,
      rating: input.rating,
    })

    return new StepResponse(updatedReview, {
      id: input.id,
      originalStatus: originalReview.status,
      originalTitle: originalReview.title,
      originalContent: originalReview.content,
      originalRating: originalReview.rating,
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const reviewModuleService: ProductReviewModuleService = container.resolve(
      PRODUCT_REVIEW_MODULE
    )

    // Revert to original values
    await reviewModuleService.updateReviews(compensationData.id, {
      status: compensationData.originalStatus,
      title: compensationData.originalTitle,
      content: compensationData.originalContent,
      rating: compensationData.originalRating,
    })
  }
)