import { Text, Badge } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { useMemo } from "react"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  // check if the products and it's variants are in stock
  const inStock = useMemo(() => {
    // If there are no variants, product is out of stock
    if (!product.variants?.length) return false

    // Check if any variant is available
    return product.variants.some(variant => {
      // If variant doesn't manage inventory or allows backorders, it's in stock
      if (!variant.manage_inventory || variant.allow_backorder) return true

      // Otherwise check inventory quantity
      return variant.inventory_quantity && variant.inventory_quantity > 0
    })
  }, [product.variants])

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper" className="relative">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          className="relative z-0"
        />
        {!inStock && (
          <Badge
            color="red"
            size="large"
            className="absolute top-0 right-0 z-10 ml-2 text-xs rounded-tl-none rounded-tr-lg rounded-br-none rounded-bl-lg text-nowrap"
          >
            Sold out
          </Badge>
        )}
        <div className="flex justify-between mt-4 txt-compact-medium">
          <Text
            className="flex gap-x-2 items-center text-ui-fg-subtle"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          <div className="flex gap-x-2 items-center">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
