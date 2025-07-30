import { ProductReview } from "@/types/global"
import StarRating from "./star-rating"

interface ReviewItemProps {
  review: ProductReview
}

const ReviewItem = ({ review }: ReviewItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="pb-6 mb-6 border-b border-zinc-800 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-medium text-white bg-gray-600 rounded-full">
          {getInitials(review.first_name, review.last_name)}
        </div>

        {/* Review content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StarRating value={review.rating} readonly size="sm" />
            <span className="text-sm text-gray-500">
              {formatDate(review.created_at)}
            </span>
          </div>

          <div className="mb-2">
            <span className="font-medium text-primary">
              {review.first_name} {review.last_name.charAt(0)}.
            </span>
          </div>

          {review.title && (
            <h4 className="mb-2 font-medium text-copy-color">
              {review.title}
            </h4>
          )}

          <p className="leading-relaxed text-copy-color/70">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReviewItem
