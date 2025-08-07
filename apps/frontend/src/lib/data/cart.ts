"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Check if this cart has a pending discount code to apply
  const pendingDiscountCode = cart.metadata?.pending_discount_code as string

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      // If there was a pending discount code, try to apply it now that we have items
      if (pendingDiscountCode) {
        console.log('🎯 Applying pending discount code after adding item:', pendingDiscountCode)
        try {
          // Apply the discount code now that we have items in cart
          await sdk.store.cart
            .update(cart.id, { promo_codes: [pendingDiscountCode] }, {}, headers)
          
          // Remove the pending code from metadata since it's now applied
          await sdk.store.cart
            .update(cart.id, { 
              metadata: { 
                ...cart.metadata,
                pending_discount_code: null 
              } 
            }, {}, headers)
          
          console.log('✅ Pending discount code successfully applied:', pendingDiscountCode)
          
          // Revalidate cache again after discount application
          revalidateTag(cartCacheTag)
          
        } catch (discountError) {
          console.log('🚨 Failed to apply pending discount code:', discountError)
          // Don't throw here - item was still added successfully
        }
      }
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

// Type definitions for discount application results
export interface DiscountApplicationResult {
  success: boolean
  error?: string
  cart?: HttpTypes.StoreCart
  alreadyApplied?: boolean
}

/**
 * Enhanced function to validate and store a URL-based discount code
 * For empty carts, stores the code to be applied later when items are added
 * @param discountCode - The discount code to validate (will be normalized)
 * @returns Promise with success status, error message, and updated cart
 */
export async function applyUrlDiscountToCart(
  discountCode: string
): Promise<DiscountApplicationResult> {
  try {
    // Normalize the discount code
    const normalizedCode = discountCode.trim().toUpperCase()
    
    if (!normalizedCode) {
      return {
        success: false,
        error: "Discount code is required"
      }
    }
    
    // Check storage capability first to provide better error messages
    const canStoreData = await checkStorageCapability()
    
    if (!canStoreData) {
      return {
        success: false,
        error: "Unable to apply discount codes in private browsing mode. Please use a regular browser window or enable cookies to use discount codes."
      }
    }
    
    // Get current cart or create one to validate the discount
    let currentCart = await retrieveCart()
    
    if (!currentCart) {
      // Try to create a cart using the existing getOrSetCart function
      // This ensures proper customer association and region handling
      try {
        const defaultRegion = process.env.DEFAULT_REGION || "gb"
        currentCart = await getOrSetCart(defaultRegion)
      } catch (error) {
        // If we can't create a cart, it's likely a storage issue
        console.log('🚨 Cannot create cart for discount validation:', error)
        return {
          success: false,
          error: "Unable to apply discount codes in private browsing mode. Please use a regular browser window or enable cookies to use discount codes."
        }
      }
    }
    
    // Check if the discount is already applied or pending
    const existingPromotions = currentCart.promotions || []
    const isAlreadyApplied = existingPromotions.some(
      promotion => promotion.code === normalizedCode
    )
    
    // Check if the code is pending in metadata
    const pendingDiscountCode = currentCart.metadata?.pending_discount_code as string
    const isPendingApplication = pendingDiscountCode === normalizedCode
    
    if (isAlreadyApplied) {
      return {
        success: true,
        cart: currentCart,
        alreadyApplied: true
      }
    }
    
    if (isPendingApplication) {
      return {
        success: true,
        cart: currentCart,
        alreadyApplied: false // It's pending, not yet applied
      }
    }

    // Check if cart is empty (no line items)
    const cartHasItems = currentCart.items && currentCart.items.length > 0
    
    if (!cartHasItems) {
      // For empty carts, store the discount code to be applied later
      // We'll validate the code exists by attempting to apply it, then remove it
      console.log('🛒 Cart is empty, validating discount code:', normalizedCode)
      
      try {
        const cartId = await getCartId()
        if (!cartId) {
          return {
            success: false,
            error: "No cart found"
          }
        }

        const headers = {
          ...(await getAuthHeaders()),
        }

        // Attempt to apply the discount to validate it exists
        const result = await sdk.store.cart
          .update(cartId, { promo_codes: [normalizedCode] }, {}, headers)
        
        // Check if the code was recognized (it might not be applied due to empty cart)
        const wasCodeRecognized = result.cart
        
        if (!wasCodeRecognized) {
          return {
            success: false,
            error: "This discount code is not valid or has expired"
          }
        }

        // For empty carts, store the code in cart metadata to be applied later
        const updatedCartWithCode = await sdk.store.cart
          .update(cartId, { 
            metadata: { 
              ...currentCart.metadata,
              pending_discount_code: normalizedCode 
            } 
          }, {}, headers)

        // Revalidate cache
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)
        
        console.log('✅ Discount code validated and stored for empty cart:', normalizedCode)
        return {
          success: true,
          cart: updatedCartWithCode.cart,
          alreadyApplied: false
        }
        
      } catch (validationError) {
        console.log('🚨 Discount validation failed:', validationError)
        // Handle specific validation errors
        if (validationError instanceof Error) {
          const message = validationError.message.toLowerCase()
          if (message.includes("promotion") && message.includes("not found")) {
            return {
              success: false,
              error: "This discount code doesn't exist or has expired"
            }
          }
        }
        return {
          success: false,
          error: "This discount code is not valid or has expired"
        }
      }
    }
    
    // Apply the promotion for carts with items
    let updatedCart: HttpTypes.StoreCart | null = null
    
    try {
      const cartId = await getCartId()
      if (!cartId) {
        return {
          success: false,
          error: "No cart found"
        }
      }

      const headers = {
        ...(await getAuthHeaders()),
      }

      const result = await sdk.store.cart
        .update(cartId, { promo_codes: [normalizedCode] }, {}, headers)
      
      updatedCart = result.cart
      
      // Only revalidate cache once, after we have the result
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      
    } catch (updateError) {
      // If the direct update fails, fall back to the original method
      console.log('🔄 Direct cart update failed, falling back to applyPromotions')
      await applyPromotions([normalizedCode])
      updatedCart = await retrieveCart()
    }
    
    if (!updatedCart) {
      return {
        success: false,
        error: "Could not verify cart after applying discount"
      }
    }
    
    // Check if the promotion was actually applied by looking at the cart promotions
    const appliedPromotions = updatedCart.promotions || []
    const discountWasApplied = appliedPromotions.some(
      promotion => promotion.code === normalizedCode
    )
    
    if (!discountWasApplied) {
      console.log('🚨 Discount was not applied to cart. Available promotions:', appliedPromotions)
      return {
        success: false,
        error: "This discount code is not valid or has expired",
        cart: updatedCart
      }
    }
    
    console.log('✅ Discount successfully applied to cart:', appliedPromotions)
    return {
      success: true,
      cart: updatedCart
    }
    
  } catch (error) {
    // Enhanced error handling for common Medusa promotion errors
    console.log('🚨 applyUrlDiscountToCart - Error caught:', error)
    let errorMessage = "Failed to apply discount code"
    
    if (error instanceof Error) {
      console.log('🚨 Error message:', error.message)
      const message = error.message.toLowerCase()
      
      if (message.includes("promotion") && message.includes("not found")) {
        errorMessage = "This discount code doesn't exist or has expired"
      } else if (message.includes("not eligible") || message.includes("requirements")) {
        errorMessage = "Your cart doesn't meet the requirements for this discount"
      } else if (message.includes("expired")) {
        errorMessage = "This discount code has expired"
      } else if (message.includes("usage limit")) {
        errorMessage = "This discount code has reached its usage limit"
      } else if (message.includes("promo_codes")) {
        errorMessage = "This discount code is not valid"
      } else if (message.includes("no existing cart") || message.includes("cart") && (message.includes("not found") || message.includes("missing"))) {
        // Check if this is a storage/cookie issue
        const canStoreData = await checkStorageCapability()
        if (!canStoreData) {
          errorMessage = "Unable to apply discount codes in private browsing mode. Please use a regular browser window or enable cookies to use discount codes."
        } else {
          errorMessage = "Cart not found. Please add items to your cart first."
        }
      } else if (message.includes("fetch")) {
        errorMessage = "Unable to connect to server. Please check your internet connection and try again."
      } else {
        errorMessage = error.message
      }
    }
    
    console.log('🚨 Final error message:', errorMessage)
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Get all promotion codes currently applied to the cart
 * @returns Array of promotion codes currently applied
 */
export async function getAppliedPromotionCodes(): Promise<string[]> {
  try {
    const cart = await retrieveCart()
    if (!cart || !cart.promotions) {
      return []
    }
    
    return cart.promotions
      .filter(promotion => promotion.code)
      .map(promotion => promotion.code!)
      
  } catch (error) {
    console.error("Failed to retrieve applied promotion codes:", error)
    return []
  }
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}

/**
 * Check if we can store data (cookies, localStorage) - useful for detecting incognito mode
 * @returns Promise<boolean> - true if storage is available, false otherwise
 */
async function checkStorageCapability(): Promise<boolean> {
  if (typeof window === 'undefined') {
    // Server-side, assume storage is available
    return true
  }

  try {
    // Test cookie storage
    const testCookieName = '_test_storage_capability'
    document.cookie = `${testCookieName}=test; path=/; max-age=1`
    const cookieSet = document.cookie.includes(testCookieName)
    
    // Clean up test cookie
    if (cookieSet) {
      document.cookie = `${testCookieName}=; path=/; max-age=0`
    }

    // Test localStorage (also often restricted in incognito)
    try {
      const testKey = '_test_local_storage'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return cookieSet // Both cookie and localStorage should work
    } catch (localStorageError) {
      // localStorage failed, but cookies might still work
      return cookieSet
    }
    
  } catch (error) {
    console.log('🚨 Storage capability check failed:', error)
    return false
  }
}
