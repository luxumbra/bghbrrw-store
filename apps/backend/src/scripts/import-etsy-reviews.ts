import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import ProductReviewModuleService from "../modules/product-review/service"
import fs from "fs"
import path from "path"

type EtsyReview = {
  reviewer: string
  date_reviewed: string
  star_rating: number
  message: string
  order_id: number
}

export default async function importEtsyReviews({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const reviewModuleService: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

  logger.info("Starting Etsy reviews import...")

  try {
    // Check for existing reviews to prevent duplicates
    const { data: existingReviews } = await query.graph({
      entity: "review",
      fields: ["id", "content", "first_name", "last_name", "rating"],
    })

    logger.info(`Found ${existingReviews?.length || 0} existing reviews in database`)

    // Read the Etsy reviews JSON file
    const reviewsPath = path.join(process.cwd(), "../../etsy/reviews.json")
    const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, "utf8")) as EtsyReview[]

    // Read mapping configuration if it exists
    const mappingPath = path.join(process.cwd(), "../../etsy/review-mapping.json")
    let mappingConfig = null
    try {
      if (fs.existsSync(mappingPath)) {
        mappingConfig = JSON.parse(fs.readFileSync(mappingPath, "utf8"))
        logger.info("Loaded review mapping configuration")
      }
    } catch (error) {
      logger.warn("Could not load mapping configuration, using intelligent mapping only")
    }

    logger.info(`Found ${reviewsData.length} Etsy reviews to import`)

    // Get all products to map reviews to
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle"],
    })

    if (!products || products.length === 0) {
      logger.warn("No products found in database. Skipping import.")
      return
    }

    logger.info(`Found ${products.length} products in database`)
    
    // Log available products for mapping reference
    logger.info("Available products for mapping:")
    products.slice(0, 10).forEach(product => {
      logger.info(`  - ${product.title} (handle: ${product.handle})`)
    })
    if (products.length > 10) {
      logger.info(`  ... and ${products.length - 10} more products`)
    }

    // Map reviews to products more intelligently
    const importedReviews = []

    // Create a mapping strategy - we'll look for wood/lighting related products first
    const getMatchingProduct = (etsyReview: EtsyReview, products: any[]) => {
      // Check for manual mapping first
      if (mappingConfig?.manualMappings?.[etsyReview.order_id]) {
        const mapping = mappingConfig.manualMappings[etsyReview.order_id]
        if (mapping.productHandle) {
          const mappedProduct = products.find(p => p.handle === mapping.productHandle)
          if (mappedProduct) {
            logger.info(`Using manual mapping for order ${etsyReview.order_id} -> ${mapping.productHandle}`)
            return mappedProduct
          }
        }
      }
      
      // Use intelligent mapping based on content
      const content = etsyReview.message.toLowerCase()
      
      // Look for specific product indicators in the review content
      if (content.includes('wood') || content.includes('slice') || content.includes('natural')) {
        // Find wood-related products
        const woodProduct = products.find(p => 
          p.title?.toLowerCase().includes('wood') || 
          p.title?.toLowerCase().includes('slice') ||
          p.handle?.includes('wood')
        )
        if (woodProduct) return woodProduct
      }
      
      if (content.includes('light') || content.includes('lights')) {
        // Find lighting products
        const lightProduct = products.find(p => 
          p.title?.toLowerCase().includes('light') || 
          p.title?.toLowerCase().includes('lamp') ||
          p.handle?.includes('light')
        )
        if (lightProduct) return lightProduct
      }
      
      if (content.includes('gonk') || content.includes('flower')) {
        // Find decorative products
        const decorProduct = products.find(p => 
          p.title?.toLowerCase().includes('gonk') || 
          p.title?.toLowerCase().includes('flower') ||
          p.title?.toLowerCase().includes('decor')
        )
        if (decorProduct) return decorProduct
      }
      
      // Default: return the first product (or you could randomize)
      return products[0]
    }

    for (const etsyReview of reviewsData) {
      // Parse the reviewer name
      const nameParts = etsyReview.reviewer.trim().split(" ")
      const firstName = nameParts[0] || "Anonymous"
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User"

      // Check if this review already exists to prevent duplicates
      const isDuplicate = existingReviews?.some(existing => 
        existing.content === etsyReview.message &&
        existing.first_name === firstName &&
        existing.last_name === lastName &&
        existing.rating === etsyReview.star_rating
      )

      if (isDuplicate) {
        logger.info(`Skipping duplicate review from ${firstName} ${lastName}`)
        continue
      }

      const targetProduct = getMatchingProduct(etsyReview, products)
      
      logger.info(`Mapping review from ${etsyReview.reviewer} to product: ${targetProduct.title} (${targetProduct.handle})`)

      // Convert date format from MM/DD/YYYY to ISO string
      const [month, day, year] = etsyReview.date_reviewed.split("/")
      const reviewDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)

      const reviewData = {
        product_id: targetProduct.id,
        rating: etsyReview.star_rating,
        content: etsyReview.message,
        first_name: firstName,
        last_name: lastName,
        status: "approved", // Import as approved since these are real reviews
        created_at: reviewDate,
        updated_at: reviewDate,
      }

      try {
        const review = await reviewModuleService.createReviews(reviewData)
        importedReviews.push(review)
        
        logger.info(`Imported review from ${firstName} ${lastName} for product: ${targetProduct.title}`)
      } catch (error) {
        logger.error(`Failed to import review from ${firstName} ${lastName}:`, error)
      }
    }

    logger.info(`Successfully imported ${importedReviews.length} out of ${reviewsData.length} reviews`)

    // Log summary by product
    const reviewsByProduct = importedReviews.reduce((acc, review) => {
      acc[review.product_id] = (acc[review.product_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    logger.info("Import summary by product:")
    for (const [productId, count] of Object.entries(reviewsByProduct)) {
      const product = products.find(p => p.id === productId)
      logger.info(`  - ${product?.title || productId}: ${count} reviews`)
    }

  } catch (error) {
    logger.error("Failed to import Etsy reviews:", error)
    throw error
  }
}

// Export for use as a script
export const config = {
  name: "import-etsy-reviews",
  alias: "ier"
}