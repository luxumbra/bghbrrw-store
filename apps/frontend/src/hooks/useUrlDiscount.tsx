"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useEffect, useRef } from "react"

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
  const prevDiscountCodeRef = useRef<string | null>(null)
  
  // Memoized discount code extraction with normalization
  const discountCode = useMemo(() => {
    // Only use searchParams - avoid window.location fallback that causes infinite loops
    const code = searchParams.get('discount')
    
    if (!code) {
      prevDiscountCodeRef.current = null
      return null
    }
    
    // Normalize the code: trim whitespace and convert to uppercase
    const normalizedCode = code.trim().toUpperCase()
    const finalCode = normalizedCode.length > 0 ? normalizedCode : null
    
    // Only update if the code actually changed
    if (prevDiscountCodeRef.current !== finalCode) {
      prevDiscountCodeRef.current = finalCode
    }
    
    return finalCode
  }, [searchParams])
  
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