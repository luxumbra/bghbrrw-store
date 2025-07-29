"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { getCollectionReviews, CollectionReviewsResponse } from "@/lib/data/collections"
import StarRating from "@/modules/products/components/product-reviews/star-rating"
import ReviewItem from "@/modules/products/components/product-reviews/review-item"

interface CollectionReviewsProps {
  collection: HttpTypes.StoreCollection
}

const CollectionReviews = ({ collection }: CollectionReviewsProps) => {
  const [reviewsData, setReviewsData] = useState<CollectionReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadReviews = async (offset = 0, append = false) => {
    try {
      if (offset === 0) setLoading(true)
      else setLoadingMore(true)

      const data = await getCollectionReviews({
        collectionId: collection.id,
        limit: 10,
        offset
      })

      if (append && reviewsData) {
        setReviewsData({
          ...data,
          reviews: [...reviewsData.reviews, ...data.reviews]
        })
      } else {
        setReviewsData(data)
      }
    } catch (error) {
      console.error("Error loading collection reviews:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [collection.id])

  const handleLoadMore = () => {
    if (reviewsData) {
      loadReviews(reviewsData.reviews.length, true)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasReviews = reviewsData && reviewsData.reviews.length > 0
  const averageRating = reviewsData?.average_rating || 0
  const totalReviews = reviewsData?.total_reviews || 0

  if (!hasReviews) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No reviews yet for products in this collection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Collection Reviews Summary */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="mb-4">Collection Reviews</h2>
        <p className="text-gray-600 mb-4">
          Reviews from customers who purchased products in the "{collection.title}" collection
        </p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <StarRating value={averageRating} readonly />
            <span className="text-lg font-medium">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-gray-600">
            ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <div className="space-y-6">
          {reviewsData.reviews.filter(review => review && review.id).map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>

        {/* Load More Button */}
        {reviewsData.reviews.length < reviewsData.total_reviews && (
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
    </div>
  )
}

export default CollectionReviews