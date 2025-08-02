import { NextRequest, NextResponse } from "next/server"
import { getShowcaseReviews } from "@/lib/data/products"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const minRating = parseInt(searchParams.get("minRating") || "1")

    const data = await getShowcaseReviews({
      limit,
      offset,
      minRating,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching showcase reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}