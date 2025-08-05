import type { Metadata } from "next"
import ReviewsPageClient from "./reviews-client"

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Read reviews from our customers about their Bough & Burrow handcrafted wooden products. Discover what makes our rustic, earthy décor special.",
}

export default function ReviewsPage() {
  return <ReviewsPageClient />
}
