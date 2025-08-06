"use client"

import { useState, useEffect } from "react"
import StarRating from "@/modules/products/components/product-reviews/star-rating"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

interface BusinessRatingWidgetProps {
  size?: "small" | "large"
  showLink?: boolean
    className?: string
    alignment?: "left" | "center" | "right"
}

interface BusinessStats {
  overall_rating: number
  total_reviews: number
}

const BusinessRatingWidget = ({
  size = "small",
  showLink = true,
    className = "",
  alignment = "center"
}: BusinessRatingWidgetProps) => {
  const [businessStats, setBusinessStats] = useState<BusinessStats | null>(null)
  const [loading, setLoading] = useState(true)
    const alignmentClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    }

  useEffect(() => {
    const loadBusinessStats = async () => {
      try {
        const response = await fetch(`/api/reviews/showcase?limit=1`)
        if (!response.ok) {
          throw new Error('Failed to fetch business stats')
        }
        const data = await response.json()

        if (data.business_stats) {
          setBusinessStats(data.business_stats)
        }
      } catch (error) {
        console.error("Failed to load business stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBusinessStats()
  }, [])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-20 h-5 rounded bg-zinc-700"></div>
          <div className="w-16 h-4 rounded bg-zinc-700"></div>
        </div>
      </div>
    )
  }

  if (!businessStats || businessStats.total_reviews === 0) {
    return null
  }

  const { overall_rating, total_reviews } = businessStats

  const isLarge = size === "large"
  const starSize = isLarge ? "md" : "sm"
  const ratingTextSize = isLarge ? "text-2xl" : "text-lg"
  const reviewTextSize = isLarge ? "text-base" : "text-sm"

  return (
    <div className={`flex flex-col ${alignmentClasses[alignment]} lg:items-start gap-2 ${className}`}>
      <div className={`flex items-center gap-3`}>
        <StarRating value={overall_rating} readonly size={starSize} />
        <span className={`font-semibold text-zinc-300 ${ratingTextSize}`}>
          {overall_rating}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-zinc-300 ${reviewTextSize}`}>
          Based on {total_reviews} {total_reviews === 1 ? "review" : "reviews"}
        </span>

        {showLink && (
          <LocalizedClientLink href="/reviews" className={`text-blue-600 hover:text-blue-800 underline ${reviewTextSize}`}>
            Read all reviews
          </LocalizedClientLink>
        )}
      </div>
    </div>
  )
}

export default BusinessRatingWidget
