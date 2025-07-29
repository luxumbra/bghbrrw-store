"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { getProductReviews } from "@/lib/data/products"
import { ProductReview, ReviewsResponse } from "@/types/global"
import StarRating from "./star-rating"
import ReviewItem from "./review-item"
interface ProductReviewsProps {
  product: HttpTypes.StoreProduct
}

const ProductReviews = ({ product }: ProductReviewsProps) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)


  console.log("REVIEWS DATA", reviewsData)

  const loadReviews = async (offset = 0, append = false) => {
    try {
      const data = await getProductReviews({
        productId: product.id,
        limit: 10,
        offset,
      })

      if (append && reviewsData) {
        setReviewsData({
          ...data,
          reviews: [...reviewsData.reviews, ...data.reviews],
        })
      } else {
        setReviewsData(data)
      }
    } catch (error) {
      console.error("Failed to load reviews:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [product.id])

  const handleLoadMore = () => {
    if (reviewsData && reviewsData.reviews.length < reviewsData.count) {
      setLoadingMore(true)
      loadReviews(reviewsData.reviews.length, true)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  const hasReviews = reviewsData && reviewsData.reviews.length > 0
  const averageRating = reviewsData?.average_rating || 0
  const totalReviews = reviewsData?.count || 0

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="mb-4">Customer Reviews</h2>

        {hasReviews ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <StarRating value={averageRating} readonly />
              <span className="text-lg ">{averageRating.toFixed(1)}</span>
            </div>
            <span className="">
              ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        ) : (
          <p className="mb-4">No reviews yet for this product.</p>
        )}

        <div className="p-4">
          <p className="text-sm text-copy-color">
            <strong>Want to leave a review?</strong> Reviews are available after
            purchase. You can leave a review from your account dashboard once
            your order is delivered.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {hasReviews && (
        <div>
          <div className="space-y-6">
            {reviewsData.reviews
              .filter((review) => review && review.id)
              .map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
          </div>

          {/* Load More Button */}
          {reviewsData.reviews.length < reviewsData.count && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Loading..." : "Load More Reviews"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductReviews
