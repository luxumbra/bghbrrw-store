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
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {getInitials(review.first_name, review.last_name)}
        </div>
        
        {/* Review content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StarRating value={review.rating} readonly size="sm" />
            <span className="text-sm text-gray-600">
              {formatDate(review.created_at)}
            </span>
          </div>
          
          <div className="mb-2">
            <span className="font-medium text-gray-900">
              {review.first_name} {review.last_name.charAt(0)}.
            </span>
          </div>
          
          {review.title && (
            <h4 className="font-medium text-gray-900 mb-2">
              {review.title}
            </h4>
          )}
          
          <p className="text-gray-700 leading-relaxed">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReviewItem