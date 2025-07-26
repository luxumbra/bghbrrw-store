import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import { BenefitsBar, benefitsData } from "@modules/common/components/benefits-bar"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  const { shopWithConfidence, whyBoughAndBurrow } = benefitsData

  return collections.map((collection, index) => {
    // is borderless if it is the first item in the list
    const isBorderless = index === 0;
    // Show benefits bar on even indices (0, 2, 4, etc.)
    const showBenefits = index % 2 === 0
    // Alternate between the two benefit sets
    const benefits = Math.floor(index / 2) % 2 === 0 ? shopWithConfidence : whyBoughAndBurrow

    return (
      <li key={collection.id}>
        {showBenefits && <BenefitsBar benefits={benefits} borderless={isBorderless} />}
        <ProductRail collection={collection} region={region} />
      </li>
    )
  })
}
