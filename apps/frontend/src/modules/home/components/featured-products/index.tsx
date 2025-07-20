import { getContentKey } from "@lib/util/helpers"
import { HttpTypes } from "@medusajs/types"
import { BenefitsBar, benefitsData } from "@modules/common/components/benefits-bar"
import ProductRail from "@modules/home/components/featured-products/product-rail"



export default async function   FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
    }) {
    const { shopWithConfidence, whyBoughAndBurrow } = benefitsData

  return collections.map((collection, index) => {
    // the first and every two rows after it
    const isFirstOrEveryTwoAfter = index === 0 || index % 2 === 0;
    let benefitsCount = 0;

    if (isFirstOrEveryTwoAfter) {
      benefitsCount++;
    }
    console.log({benefitsCount});

    return (
      <li key={getContentKey(collection.id)}>
        {isFirstOrEveryTwoAfter && ( benefitsCount < 2 ? <BenefitsBar benefits={shopWithConfidence} /> : <BenefitsBar benefits={whyBoughAndBurrow} />)}
        <ProductRail collection={collection} region={region} />
      </li>
    )
  })
}
