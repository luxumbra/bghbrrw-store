"use client"

import { useState, useEffect } from "react"
import { ProductReview, ReviewsResponse } from "@/types/global"
import BusinessRatingWidget from "@/modules/common/components/business-rating-widget"
import ReviewItem from "@/modules/products/components/product-reviews/review-item"

const ReviewsPageClient = () => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadReviews = async (offset = 0, append = false) => {
    try {
      if (offset === 0) setLoading(true)
      else setLoadingMore(true)

      const response = await fetch(`/api/reviews/showcase?limit=20&offset=${offset}&minRating=1`)
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const data = await response.json()

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
  }, [])

  const handleLoadMore = () => {
    if (reviewsData && reviewsData.reviews.length < reviewsData.count) {
      loadReviews(reviewsData.reviews.length, true)
    }
  }

  if (loading) {
    return (
      <div className="content-container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section Loading */}
          <div className="text-center mb-16 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
            <div className="h-20 bg-gray-200 rounded w-80 mx-auto"></div>
          </div>

          {/* Reviews Loading */}
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasReviews = reviewsData && reviewsData.reviews.length > 0

  return (
    <div className="content-container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Customer Reviews
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Read what our customers say about their handcrafted Bough & Burrow products. 
            Every review is from a verified purchase.
          </p>
          
          {/* Business Rating Display */}
          <div className="flex justify-center">
            <BusinessRatingWidget size="large" showLink={false} />
          </div>
        </div>

        {/* Reviews List */}
        {hasReviews ? (
          <div>
            <div className="space-y-8">
              {reviewsData.reviews
                .filter((review) => review && review.id)
                .map((review) => (
                  <div key={review.id} className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <ReviewItem review={review} />
                  </div>
                ))}
            </div>

            {/* Load More Button */}
            {reviewsData.reviews.length < reviewsData.count && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? "Loading..." : "Load More Reviews"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No reviews yet. Be the first to leave a review after your purchase!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsPageClient