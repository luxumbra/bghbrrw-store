"use client"

import { Badge } from "@medusajs/ui"
import { useEffect, useState, useRef } from "react"
import { retrieveCart } from "@lib/data/cart"

/**
 * Displays a badge with the currently applied discount code in the cart
 * Positioned absolutely to appear as a small indicator on the cart icon
 */
export default function DiscountBadge() {
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<string | null>(null)

  // Check for active promotions in the cart with optimization
  const checkForPromotions = async () => {
    try {
      const cart = await retrieveCart()
      const currentCode = cart?.promotions?.[0]?.code || null
      
      // Only update state if the discount code actually changed
      if (currentCode !== lastCheckRef.current) {
        lastCheckRef.current = currentCode
        setDiscountCode(currentCode)
      }
    } catch (error) {
      console.error('Error checking for promotions:', error)
      // Only update state if we had a code before
      if (lastCheckRef.current !== null) {
        lastCheckRef.current = null
        setDiscountCode(null)
      }
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

    // Set up interval with longer delay and proper cleanup
    intervalRef.current = setInterval(() => {
      checkForPromotions()
    }, 30000) // Reduced frequency: Check every 30 seconds instead of 10

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
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
