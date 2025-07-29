import { InjectManager, MedusaService, MedusaContext } from "@medusajs/framework/utils"
import Review from "./models/review"
import ReviewCollectionLink from "./models/review-collection-link"
import { Context } from "@medusajs/framework/types"
import { EntityManager } from "@mikro-orm/knex"

class ProductReviewModuleService extends MedusaService({
  Review,
  ReviewCollectionLink,
}) {
  @InjectManager() 
  async getAverageRating(
    productId: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<number> { 
    const result = await sharedContext?.manager?.execute(
      `SELECT AVG(rating) as average 
       FROM review 
       WHERE product_id = '${productId}' AND status = 'approved'`
    )

    return parseFloat(parseFloat(result?.[0]?.average ?? 0).toFixed(2))
  }

  @InjectManager()
  async getCollectionAverageRating(
    collectionId: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<number> {
    const result = await sharedContext?.manager?.execute(
      `SELECT AVG(rating) as average 
       FROM review 
       WHERE collection_id = '${collectionId}' AND status = 'approved'`
    )

    return parseFloat(parseFloat(result?.[0]?.average ?? 0).toFixed(2))
  }

  @InjectManager()
  async linkReviewToCollection(
    reviewId: string,
    collectionId: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ) {
    return await this.createReviewCollectionLinks({
      review_id: reviewId,
      collection_id: collectionId
    }, sharedContext)
  }

  @InjectManager()
  async getReviewsByCollection(
    collectionId: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ) {
    return await this.listReviews({
      collection_id: collectionId,
      status: "approved"
    }, {}, sharedContext)
  }
}

export default ProductReviewModuleService