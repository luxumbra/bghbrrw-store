"use client"

import { useState, useEffect } from "react"
import { ReviewsResponse } from "@/types/global"
import StarRating from "@/modules/products/components/product-reviews/star-rating"
import BusinessRatingWidget from "@/modules/common/components/business-rating-widget"

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
  minRating = 1,
  className = ""
}: ReviewShowcaseProps) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadShowcaseReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/showcase?limit=${limit}&minRating=${minRating}`)
        if (!response.ok) {
          throw new Error('Failed to fetch showcase reviews')
        }
        const data = await response.json()
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
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center animate-pulse">
            <div className="w-64 h-8 mx-auto mb-4 rounded bg-zinc-700"></div>
            <div className="w-48 h-4 mx-auto rounded bg-zinc-700"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].slice(0, limit).map((i) => (
              <div key={i} className="p-6 bg-white border rounded-lg shadow-sm animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-20 h-4 rounded bg-zinc-700"></div>
                  <div className="w-8 h-4 rounded bg-zinc-700"></div>
                </div>
                <div className="w-full h-3 mb-2 rounded bg-zinc-700"></div>
                <div className="w-4/5 h-3 mb-2 rounded bg-zinc-700"></div>
                <div className="w-3/5 h-3 mb-4 rounded bg-zinc-700"></div>
                <div className="w-24 h-3 rounded bg-zinc-700"></div>
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
    <div className={`py-16 bg-zinc-800 ${className}`}>
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-xl font-bold lg:text-3xl text-copy-color">{title}</h2>
          <p className="max-w-2xl mx-auto mb-6 text-base lg:text-lg text-copy-color">{subtitle}</p>

          {/* Business Rating Widget */}
          <div className="flex justify-center">
            <BusinessRatingWidget size="small" showLink={true} />
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviewsData.reviews.map((review) => (
            <div key={review.id} className="p-4 transition-shadow rounded-lg shadow-md lg:p-6 group bg-primary-bg hover:shadow-lg shadow-black/80 hover:shadow-black/80">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating value={review.rating} readonly size="sm" />
                <span className="text-sm font-medium text-zinc-400">
                  {review.rating}/5
                </span>
              </div>

              {/* Review Content */}
              <blockquote className="mb-4 text-copy-color line-clamp-4">
                "{review.content}"
              </blockquote>

              {/* Reviewer */}
              <div className="text-sm text-zinc-400">
                — {review.first_name} {review.last_name}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {reviewsData.count > limit && (
          <div className="mt-12 text-center">
            <p className="mb-4 text-primary">
             ✨ Join {reviewsData.count}+ happy customers ✨
            </p>
            <a
              href="/store"
              className="inline-block px-8 py-3 text-white transition-colors rounded-md bg-zinc-900 hover:bg-zinc-700"
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
