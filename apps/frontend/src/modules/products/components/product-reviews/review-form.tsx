"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import StarRating from "./star-rating"
import { ProductReview } from "@/types/global"
import { addProductReview } from "@/lib/data/products"

interface ReviewFormProps {
  productId: string
  onReviewSubmitted?: (review: ProductReview) => void
  isAuthenticated: boolean
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Submitting..." : "Submit Review"}
    </button>
  )
}

const ReviewForm = ({ productId, onReviewSubmitted, isAuthenticated }: ReviewFormProps) => {
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    if (!isAuthenticated) {
      setSubmitMessage("Please log in to submit a review")
      return
    }

    if (rating === 0) {
      setSubmitMessage("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const result = await addProductReview({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        rating,
        product_id: productId,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
      })

      setSubmitMessage("Thank you! Your review has been submitted and is pending approval.")
      setRating(0)
      
      // Reset form
      const form = document.getElementById("review-form") as HTMLFormElement
      form?.reset()
      
      if (onReviewSubmitted) {
        onReviewSubmitted(result.review)
      }
    } catch (error) {
      setSubmitMessage("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Write a Review</h3>
        <p className="text-gray-600">
          Please <a href="/account" className="text-blue-600 hover:underline">log in</a> to submit a review.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      
      <form id="review-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Review Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief summary of your review"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Review *
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your thoughts about this product..."
          />
        </div>

        <SubmitButton />

        {submitMessage && (
          <div className={`p-3 rounded-md ${
            submitMessage.includes("Thank you") 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  )
}

export default ReviewForm