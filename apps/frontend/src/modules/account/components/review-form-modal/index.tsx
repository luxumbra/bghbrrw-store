"use client"

import { useState } from "react"
import { Button, FocusModal } from "@medusajs/ui"
import { submitOrderReview } from "@/lib/data/customer"
import StarRating from "@/modules/products/components/product-reviews/star-rating"

interface ReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  productId: string
  productTitle: string
  customerName?: { firstName: string; lastName: string }
}

const ReviewFormModal = ({
  isOpen,
  onClose,
  orderId,
  productId,
  productTitle,
  customerName
}: ReviewFormModalProps) => {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [firstName, setFirstName] = useState(customerName?.firstName || "")
  const [lastName, setLastName] = useState(customerName?.lastName || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!content.trim() || content.length < 10) {
      setError("Review content must be at least 10 characters long")
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please provide your first and last name")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitOrderReview({
        orderId,
        productId,
        title: title.trim() || undefined,
        content: content.trim(),
        rating,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })

      if (result.success) {
        setIsSuccess(true)
        // Close modal after showing success message briefly
        setTimeout(() => {
          onClose()
          // Reset form
          setTitle("")
          setContent("")
          setRating(5)
          setIsSuccess(false)
        }, 2000)
      } else {
        setError(result.error || "Failed to submit review")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FocusModal open={isOpen} onOpenChange={onClose}>
      <FocusModal.Content className="max-w-3xl p-16 mx-auto h-3/4">
        <FocusModal.Header className="flex flex-col items-start">
          <FocusModal.Title className="text-3xl">Write a Review</FocusModal.Title>
          <FocusModal.Description>
            Share your experience with "{productTitle}"
          </FocusModal.Description>
        </FocusModal.Header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FocusModal.Body className="space-y-6">
            {error && (
              <div className="p-3 border border-red-200 rounded-md bg-red-50">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {isSuccess && (
              <div className="p-3 border border-green-200 rounded-md bg-green-50">
                <p className="text-sm text-green-800">
                  ✓ Review submitted successfully! It will be reviewed by our team before being published.
                </p>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block mb-2 text-sm font-medium text-copy-color">
                Rating *
              </label>
              <StarRating
                value={rating}
                onChange={setRating}
                readonly={false}
              />
            </div>

            {/* Customer Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-copy-color">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-copy-color">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block mb-2 text-sm font-medium text-copy-color">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                maxLength={100}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block mb-2 text-sm font-medium text-copy-color">
                Your Review *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this product..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
                minLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters ({content.length}/10)
              </p>
            </div>
          </FocusModal.Body>

          <FocusModal.Footer>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || content.length < 10}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}

export default ReviewFormModal
