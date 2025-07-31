import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductReviews from "@modules/products/components/product-reviews"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { BenefitsBar, BenefitsList, benefitsData } from "@/modules/common/components/benefits-bar"
import { retrieveCustomer } from "@/lib/data/customer"
import ProductImageCarousel, { SlideImage } from "@/modules/common/components/product-image-carousel"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const isAuthenticated = !!customer
const sliderImages: SlideImage[] = product.images?.map((image) => ({
  src: image.url,
  alt: product.subtitle || product.title,
})) || []

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6 order-1 small:order-0">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative order-0">
          {sliderImages && (
          <div className="small:hidden block order-0">
            <ProductImageCarousel 
              images={sliderImages || []} 
              aspectRatio="tall"
              showDots={true}
              showArrows={true}
              autoPlay={true}
              autoPlayInterval={5000}
            />
          </div>
          )}
          {product.images && (
          <div className="hidden small:block">
            <ImageGallery images={product.images || []} />
          </div>
          )}
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12 order-2 small:order-1">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
          <BenefitsList benefits={benefitsData.shopWithConfidence} borderless={true} />
        </div>
      </div>

      {/* Product Reviews Section */}
      <div
        className="content-container my-16 small:my-32"
        data-testid="product-reviews-container"
      >
        <ProductReviews product={product} />
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
