import { 
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateReviewStep } from "./steps/update-review"

type UpdateReviewInput = {
  id: string
  status?: "pending" | "approved" | "rejected"
  title?: string
  content?: string
  rating?: number
}

export const updateReviewWorkflow = createWorkflow(
  "update-review",
  (input: UpdateReviewInput) => {
    const updatedReview = updateReviewStep(input)

    return new WorkflowResponse({
      review: updatedReview
    })
  }
)