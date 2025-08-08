import { type Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { type StoreCartShippingOption, type HttpTypes } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  // Only try to get the cart first
  const cart = await retrieveCart()
  let customer: HttpTypes.StoreCustomer | null = null
  let shippingOptions: StoreCartShippingOption[] = []

  // Only fetch customer data if we have a cart with an associated customer
  if (cart?.customer_id) {
    try {
      customer = await retrieveCustomer()
    } catch (error) {
      console.error('Error fetching customer data:', error)
      // Continue without customer data if there's an error
    }
  }

  // Only fetch shipping options if we have a cart
  if (cart) {
    try {
      const { shipping_options } = await listCartOptions()
      shippingOptions = shipping_options
    } catch (error) {
      console.error('Error fetching shipping options:', error)
    }
  }

  return (
    <>
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
    </>
  )
}
