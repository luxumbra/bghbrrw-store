"use client"

import React, { useEffect, useCallback } from "react"
import { useUrlDiscount } from "@/hooks/useUrlDiscount"
import { useDiscountContext } from "@/context/discount-context"
import { retrieveCart } from "@lib/data/cart"
import DiscountBanner from "@/components/common/discount-banner"

/**
 * Component that handles URL-based discount code detection and application
 * Manages the entire flow from URL parsing to cart application with proper effect cleanup
 */
const DiscountUrlHandler: React.FC = () => {
  const { discountCode, isFromUrl, clearDiscountFromUrl } = useUrlDiscount()
  const {
    urlDiscount,
    isApplying,
    isApplied,
    error,
    bannerDismissed,
    alreadyApplied,
    setUrlDiscount,
    applyUrlDiscount,
    dismissBanner,
    clearError
  } = useDiscountContext()

  // Update context when URL discount changes - minimize logging
  useEffect(() => {
    if (discountCode && isFromUrl && discountCode !== urlDiscount) {
      console.log('🎯 Setting URL discount:', discountCode)
      setUrlDiscount(discountCode)
    }
  }, [discountCode, isFromUrl, urlDiscount, setUrlDiscount])

  // Stable function reference for applying discount to prevent infinite loops
  const handleApplyDiscount = useCallback(async (code: string) => {
    // Always call applyUrlDiscount - let it handle all the error cases including no cart
    // This ensures the user gets proper feedback for all scenarios
    await applyUrlDiscount(code)
  }, [applyUrlDiscount])

  // Clear URL when successfully applied (separate effect to prevent dependency issues)
  useEffect(() => {
    if (isApplied && !error && discountCode && isFromUrl) {
      console.log('🧹 Clearing discount from URL')
      clearDiscountFromUrl()
    }
  }, [isApplied, error, discountCode, isFromUrl, clearDiscountFromUrl])

  // Effect to handle automatic discount application
  useEffect(() => {
    // Only proceed if:
    // 1. We have a discount code from URL
    // 2. It hasn't been applied yet
    // 3. We're not currently applying it
    // 4. There's no current error (unless user wants to retry)
    if (
      discountCode &&
      isFromUrl &&
      !isApplied &&
      !isApplying &&
      (!error || urlDiscount !== discountCode)
    ) {
      console.log('🚀 Attempting to apply discount:', discountCode)
      handleApplyDiscount(discountCode)
    }
  }, [
    discountCode,
    isFromUrl,
    isApplied,
    isApplying,
    error,
    urlDiscount,
    handleApplyDiscount
  ])

  // Retry handler for failed discount applications
  const handleRetry = useCallback(() => {
    if (discountCode) {
      clearError()
      handleApplyDiscount(discountCode)
    }
  }, [discountCode, clearError, handleApplyDiscount])

  // Enhanced dismiss handler that also clears URL
  const handleDismissWithUrlCleanup = useCallback(() => {
    dismissBanner()
    if (isFromUrl) {
      clearDiscountFromUrl()
    }
  }, [dismissBanner, isFromUrl, clearDiscountFromUrl])

  // Determine banner status
  const getBannerStatus = (): "pending" | "success" | "error" => {
    if (error) return "error"
    if (isApplied) return "success"
    if (isApplying) return "pending"
    return "pending"
  }

  // Only render banner if we have a URL discount and it hasn't been dismissed
  if (!discountCode || !isFromUrl || bannerDismissed) {
    return null
  }

  return (
    <DiscountBanner
      discountCode={discountCode}
      status={getBannerStatus()}
      error={error}
      alreadyApplied={alreadyApplied}
      onDismiss={handleDismissWithUrlCleanup}
      onRetry={error ? handleRetry : undefined}
      autoHide={true}
      autoHideDelay={10000}
    />
  )
}

export default React.memo(DiscountUrlHandler)
