"use client"

import { useState, useEffect } from "react"
import { ReviewsResponse } from "@/types/global"
import StarRating from "@/modules/products/components/product-reviews/star-rating"
import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"

interface ReviewShowcaseProps {
  title?: string
  subtitle?: string
  limit?: number
  minRating?: number
  className?: string
}

const ReviewsShowcase = ({ 
  title = "What Our Customers Say",
  subtitle = "Real reviews from our valued customers",
  limit = 6,
  minRating = 4,
  className = ""
}: ReviewShowcaseProps) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadShowcaseReviews = async () => {
      try {
        const headers = {
          ...(await getAuthHeaders()),
        }

        const next = {
          ...(await getCacheOptions("reviews")),
        }

        const data = await sdk.client.fetch<ReviewsResponse>(
          `/store/reviews/showcase`,
          {
            method: "GET",
            query: {
              limit,
              minRating,
            },
            headers,
            next,
            cache: "force-cache",
          }
        )
        setReviewsData(data)
      } catch (error) {
        console.error("Error loading showcase reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    loadShowcaseReviews()
  }, [limit, minRating])

  if (loading) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].slice(0, limit).map((i) => (
              <div key={i} className="p-6 bg-white rounded-lg shadow-sm border animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/5 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasReviews = reviewsData && reviewsData.reviews.length > 0

  if (!hasReviews) {
    return null // Don't show empty showcase
  }

  return (
    <div className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsData.reviews.map((review) => (
            <div key={review.id} className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating value={review.rating} readonly size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {review.rating}/5
                </span>
              </div>

              {/* Review Content */}
              <blockquote className="text-gray-700 mb-4 line-clamp-4">
                "{review.content}"
              </blockquote>

              {/* Reviewer */}
              <div className="text-sm text-gray-500">
                — {review.first_name} {review.last_name}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {reviewsData.count > limit && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Join {reviewsData.count}+ happy customers
            </p>
            <a 
              href="/products" 
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsShowcase