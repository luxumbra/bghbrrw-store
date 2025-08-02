"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next,
        cache: "force-cache",
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}

export interface CollectionReviewsResponse {
  reviews: any[]
  average_rating: number
  total_reviews: number
  meta: {
    count: number
    limit: number
    offset: number
  }
}

export const getCollectionReviews = async ({
  collectionId,
  limit = 10,
  offset = 0
}: {
  collectionId: string
  limit?: number
  offset?: number
}): Promise<CollectionReviewsResponse> => {
  try {
    const response = await sdk.client.fetch(`/store/reviews/collections/${collectionId}`, {
      query: {
        limit: limit.toString(),
        offset: offset.toString()
      }
    })

    return response as CollectionReviewsResponse
  } catch (error) {
    console.error("Error fetching collection reviews:", error)
    return {
      reviews: [],
      average_rating: 0,
      total_reviews: 0,
      meta: { count: 0, limit, offset }
    }
  }
}

export const getShowcaseReviews = async ({
  limit = 6,
  offset = 0,
  minRating = 4
}: {
  limit?: number
  offset?: number
  minRating?: number
} = {}): Promise<CollectionReviewsResponse> => {
  try {
    const response = await sdk.client.fetch("/store/reviews/showcase", {
      query: {
        limit: limit.toString(),
        offset: offset.toString(),
        min_rating: minRating.toString()
      }
    })

    return response as CollectionReviewsResponse
  } catch (error) {
    console.error("Error fetching showcase reviews:", error)
    return {
      reviews: [],
      average_rating: 0,
      total_reviews: 0,
      meta: { count: 0, limit, offset }
    }
  }
}
