import { model } from "@medusajs/framework/utils"

const ReviewCollectionLink = model.define("review_collection_link", {
  id: model.id().primaryKey(),
  review_id: model.text().index("IDX_REVIEW_COLLECTION_LINK_REVIEW"),
  collection_id: model.text().index("IDX_REVIEW_COLLECTION_LINK_COLLECTION"),
})

export default ReviewCollectionLink