import { Text, Badge } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

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
        {(!product.variants ||
          product.variants.length === 0 ||
          product.variants.every(
            (v) =>
              v.manage_inventory &&
              (!v.inventory_quantity || v.inventory_quantity <= 0) &&
              !v.allow_backorder
          )) && (
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
