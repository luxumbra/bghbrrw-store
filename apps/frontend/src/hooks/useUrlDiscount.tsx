"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useEffect } from "react"

interface UseUrlDiscountReturn {
  discountCode: string | null
  isFromUrl: boolean
  clearDiscountFromUrl: () => void
}

/**
 * Hook to detect and manage discount codes from URL parameters
 * Handles ?discount=CODE in the URL with proper memoization and cleanup
 */
export function useUrlDiscount(): UseUrlDiscountReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Memoized discount code extraction with normalization
  const discountCode = useMemo(() => {
    console.log('🔄 useUrlDiscount - useMemo recalculating')
    console.log('📍 useUrlDiscount - searchParams:', searchParams?.toString())
    console.log('📍 useUrlDiscount - window.location.search:', typeof window !== 'undefined' ? window.location.search : 'SSR')
    
    // Try useSearchParams first
    let code = searchParams.get('discount')
    console.log('📍 useUrlDiscount - code from searchParams:', code)
    
    // Fallback to manual URL parsing if useSearchParams doesn't work
    if (!code && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      code = urlParams.get('discount')
      console.log('📍 useUrlDiscount - fallback code from window.location:', code)
    }
    
    if (!code) return null
    
    // Normalize the code: trim whitespace and convert to uppercase
    const normalizedCode = code.trim().toUpperCase()
    const result = normalizedCode.length > 0 ? normalizedCode : null
    console.log('✅ useUrlDiscount - final result:', result)
    return result
  }, [searchParams]) // Simplified dependency - let React handle URL changes
  
  // Stable function reference to prevent unnecessary re-renders
  const clearDiscountFromUrl = useCallback(() => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.delete('discount')
    
    // Use replace to avoid adding to browser history
    const newUrl = currentParams.toString() 
      ? `?${currentParams.toString()}` 
      : window.location.pathname
    
    router.replace(newUrl, { scroll: false })
  }, [searchParams, router])
  
  return {
    discountCode,
    isFromUrl: discountCode !== null,
    clearDiscountFromUrl
  }
}