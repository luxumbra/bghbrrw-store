"use client"

import { Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { retrieveCart } from "@lib/data/cart"

/**
 * Displays a badge with the currently applied discount code in the cart
 * Positioned absolutely to appear as a small indicator on the cart icon
 */
export default function DiscountBadge() {
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Check for active promotions in the cart
  const checkForPromotions = async () => {
    try {
      const cart = await retrieveCart()
      if (cart?.promotions && cart.promotions.length > 0) {
        // Get the first promotion code
        const code = cart.promotions[0]?.code

        if (code) {
          setDiscountCode(code)
          return
        }
      }
      setDiscountCode(null)
    } catch (error) {
      console.error('Error checking for promotions:', error)
      setDiscountCode(null)
    }
  }

  // Set up effect to handle mounting and periodic refresh
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Mark as mounted
    setIsMounted(true)

    // Initial check
    checkForPromotions()

    // Set up interval to refresh cart data periodically
    const interval = setInterval(() => {
      checkForPromotions()
    }, 10000) // Check every 10 seconds

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [])

  // Don't render anything if no discount is applied or not mounted yet
  if (!isMounted || !discountCode) {
    return null
  }

  return (
    <div
      className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 hover:translate-y-0 transition-all z-10"
      data-testid="discount-badge"
    >
      <Badge
        className="px-1.5 py-0.5 text-xs rounded-md font-medium bg-green-500/40 text-white border-none shadow-sm"
        title={`Discount applied: ${discountCode}`}
      >
        {discountCode} {}
      </Badge>
    </div>
  )
}
