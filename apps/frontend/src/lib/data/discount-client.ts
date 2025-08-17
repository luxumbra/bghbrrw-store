"use client"

import { HttpTypes } from "@medusajs/types"

/**
 * Client-side discount validation and management functions
 * These functions are designed to be called from client components
 */

/**
 * Calculates the monetary value of a discount for comparison
 * @param promotion - The promotion object to calculate value for
 * @param cartSubtotal - Current cart subtotal for percentage calculations
 * @returns The discount value in the cart's currency
 */
export function calculateDiscountValue(
  promotion: { application_method?: { type: string; value: number } },
  cartSubtotal: number = 0
): number {
  if (!promotion.application_method) return 0

  const { type, value } = promotion.application_method

  if (type === 'percentage') {
    // cartSubtotal is in pounds, so result is also in pounds
    return (cartSubtotal * value) / 100
  }
  
  // Fixed amount is in pounds
  return value
}

/**
 * Compares two discounts and returns comparison data
 * @param currentDiscount - Currently applied discount
 * @param newDiscount - New discount to compare
 * @param cartSubtotal - Current cart subtotal
 * @returns Comparison result with values and recommendation
 */
export function getDiscountComparison(
  currentDiscount: { code?: string; application_method?: { type: string; value: number } },
  newDiscount: { code?: string; discountValue: number; discountType: string },
  cartSubtotal: number = 0
): {
  currentValue: number
  newValue: number
  difference: number
  isBetter: boolean
  isSignificantlyBetter: boolean
  currentCode: string
  newCode: string
} {
  const currentValue = calculateDiscountValue(currentDiscount, cartSubtotal)
  const newValue = newDiscount.discountType === 'percentage' 
    ? (cartSubtotal * newDiscount.discountValue) / 100
    : newDiscount.discountValue

  const difference = newValue - currentValue
  const isBetter = difference > 0
  const isSignificantlyBetter = difference > 2.00 // £2+ improvement threshold

  console.log('🔍 Discount Comparison Debug:', {
    cartSubtotal,
    currentDiscount,
    newDiscount,
    currentValue,
    newValue,
    difference,
    differenceInPounds: difference.toFixed(2) // Values are already in pounds
  })

  return {
    currentValue,
    newValue,
    difference, // Keep the signed difference for proper calculation
    isBetter,
    isSignificantlyBetter,
    currentCode: currentDiscount.code || '',
    newCode: newDiscount.code || ''
  }
}

/**
 * Client-side discount validation - calls server actions
 * @param discountCode - The discount code to validate
 * @returns Promise with validation result and discount details
 */
export async function validateDiscountCodeClient(discountCode: string): Promise<{
  isValid: boolean
  error?: string
  discountValue?: number
  discountType?: 'percentage' | 'fixed'
  code?: string
}> {
  try {
    // Import server action dynamically
    const { validateDiscountCode } = await import("@lib/data/cart")
    return await validateDiscountCode(discountCode)
  } catch (error) {
    console.error("Error validating discount code:", error)
    return {
      isValid: false,
      error: "Unable to validate discount code. Please try again."
    }
  }
}

/**
 * Client-side discount replacement - calls server actions
 * @param newCode - New discount code to apply
 * @param existingCodes - Currently applied promotion codes
 * @returns Promise with operation result
 */
export async function replaceDiscountAsyncClient(
  newCode: string,
  existingCodes: string[] = []
): Promise<{
  success: boolean
  error?: string
  cart?: HttpTypes.StoreCart
  replaced?: boolean
  comparison?: any
}> {
  try {
    const normalizedCode = newCode.trim().toUpperCase()
    
    console.log('🔄 replaceDiscountAsyncClient called:', { newCode: normalizedCode, existingCodes })
    
    // First, validate the new code without affecting the cart
    const validation = await validateDiscountCodeClient(normalizedCode)
    
    console.log('✅ Validation result:', validation)
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || "Invalid discount code",
        replaced: false
      }
    }

    // Apply the new discount codes using server action
    const allCodes = [...existingCodes.filter(code => code !== normalizedCode), normalizedCode]
    console.log('📝 Applying codes:', allCodes)
    
    const result = await applyPromotionsClient(allCodes)
    
    console.log('🎯 Apply result:', result)
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to apply discount code",
        replaced: false
      }
    }

    return {
      success: true,
      replaced: existingCodes.length > 0,
      comparison: validation
    }
  } catch (error: any) {
    console.error("Error replacing discount:", error)
    
    // Ensure existing discounts are preserved on any error
    if (existingCodes.length > 0) {
      try {
        const restoreResult = await applyPromotionsClient(existingCodes)
        if (!restoreResult.success) {
          console.error("Failed to restore existing discounts:", restoreResult.error)
        }
      } catch (restoreError) {
        console.error("Failed to restore existing discounts:", restoreError)
      }
    }

    return {
      success: false,
      error: error?.message || "Failed to apply discount code",
      replaced: false
    }
  }
}

/**
 * Client-side promotion application - uses server action without page refresh
 * @param codes - Array of promotion codes to apply
 * @returns Promise with operation result
 */
export async function applyPromotionsClient(codes: string[]): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Use server action to update cart promotions
    const { updateCartPromotionsClientAction } = await import("@lib/data/cart")
    return await updateCartPromotionsClientAction(codes)
  } catch (error: any) {
    console.error("Error applying promotions:", error)
    return {
      success: false,
      error: error?.message || "Failed to apply promotions"
    }
  }
}