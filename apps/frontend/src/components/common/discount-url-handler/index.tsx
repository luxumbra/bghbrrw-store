"use client"

import React, { useEffect, useCallback } from "react"
import { useUrlDiscount } from "../../../hooks/useUrlDiscount"
import { useDiscountContext } from "../../../context/discount-context"
import { retrieveCart } from "@lib/data/cart"
import DiscountBanner from "../discount-banner"

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
    setUrlDiscount,
    applyUrlDiscount,
    dismissBanner,
    clearError
  } = useDiscountContext()
  
  // Update context when URL discount changes
  useEffect(() => {
    console.log('🔄 DiscountUrlHandler - useEffect[setUrlDiscount] running')
    if (discountCode && isFromUrl && discountCode !== urlDiscount) {
      console.log('🎯 Setting URL discount:', discountCode)
      setUrlDiscount(discountCode)
    }
  }, [discountCode, isFromUrl, urlDiscount, setUrlDiscount])
  
  // Stable function reference for applying discount to prevent infinite loops
  const handleApplyDiscount = useCallback(async (code: string) => {
    try {
      // Get current cart to ensure it exists before applying discount
      const cart = await retrieveCart()
      
      if (!cart?.id) {
        // If no cart exists, we'll need to wait for cart creation
        // This will be handled by the cart creation process
        return
      }
      
      await applyUrlDiscount(code)
    } catch (err) {
      console.error("Failed to apply URL discount:", err)
      // Error handling is managed by the context
    }
  }, [applyUrlDiscount])
  
  // Clear URL when successfully applied (separate effect to prevent dependency issues)
  useEffect(() => {
    console.log('🔄 DiscountUrlHandler - useEffect[clearURL] running')
    if (isApplied && !error && discountCode && isFromUrl) {
      console.log('🧹 Clearing discount from URL')
      clearDiscountFromUrl()
    }
  }, [isApplied, error, discountCode, isFromUrl, clearDiscountFromUrl])
  
  // Effect to handle automatic discount application
  useEffect(() => {
    console.log('🔄 DiscountUrlHandler - useEffect[applyDiscount] running')
    console.log('📊 State check:', { discountCode, isFromUrl, isApplied, isApplying, error, urlDiscount })
    
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
  
  // Debug render logging
  console.log('🎨 DiscountUrlHandler render:', { 
    discountCode, 
    isFromUrl, 
    bannerDismissed,
    urlDiscount,
    isApplied,
    isApplying,
    error,
    renderCount: Date.now()
  })

  // Only render banner if we have a URL discount and it hasn't been dismissed
  if (!discountCode || !isFromUrl || bannerDismissed) {
    console.log('❌ DiscountUrlHandler: Not rendering banner')
    return null
  }

  console.log('✅ DiscountUrlHandler: Rendering banner!')
  
  return (
    <DiscountBanner
      discountCode={discountCode}
      status={getBannerStatus()}
      error={error}
      onDismiss={handleDismissWithUrlCleanup}
      onRetry={error ? handleRetry : undefined}
      autoHide={true}
      autoHideDelay={10000}
    />
  )
}

export default React.memo(DiscountUrlHandler)