"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react"
import type {ReactNode} from "react"

// Enhanced discount comparison interface
interface DiscountComparison {
  currentValue: number
  newValue: number
  difference: number
  isBetter: boolean
  isSignificantlyBetter: boolean
  currentCode: string
  newCode: string
}

// State interface for discount management
interface DiscountState {
  urlDiscount: string | null
  isApplying: boolean
  isApplied: boolean
  error: string | null
  bannerDismissed: boolean
  alreadyApplied: boolean
  // Enhanced state for comparison modal
  showComparisonModal: boolean
  comparisonData: DiscountComparison | null
  pendingDiscountCode: string | null
}

// Action types for the reducer
type DiscountAction =
  | { type: "SET_URL_DISCOUNT"; payload: string }
  | { type: "START_APPLYING" }
  | { type: "APPLY_SUCCESS"; payload?: { alreadyApplied?: boolean } }
  | { type: "APPLY_ERROR"; payload: string }
  | { type: "DISMISS_BANNER" }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" }
  // Enhanced actions for comparison modal
  | { type: "SHOW_COMPARISON_MODAL"; payload: { comparison: DiscountComparison; pendingCode: string } }
  | { type: "HIDE_COMPARISON_MODAL" }
  | { type: "SET_PENDING_DISCOUNT"; payload: string }
  | { type: "CLEAR_PENDING_DISCOUNT" }

// Context value interface
interface DiscountContextValue extends DiscountState {
  setUrlDiscount: (code: string) => void
  applyUrlDiscount: (code: string) => Promise<void>
  dismissBanner: () => void
  clearError: () => void
  reset: () => void
  // Enhanced methods for comparison modal
  showComparisonModal: (comparison: DiscountComparison, pendingCode: string) => void
  hideComparisonModal: () => void
  setPendingDiscount: (code: string) => void
  clearPendingDiscount: () => void
}

// Initial state
const initialState: DiscountState = {
  urlDiscount: null,
  isApplying: false,
  isApplied: false,
  error: null,
  bannerDismissed: false,
  alreadyApplied: false,
  // Enhanced state for comparison modal
  showComparisonModal: false,
  comparisonData: null,
  pendingDiscountCode: null
}

// Reducer function with type safety
function discountReducer(state: DiscountState, action: DiscountAction): DiscountState {
  switch (action.type) {
    case "SET_URL_DISCOUNT":
      return {
        ...state,
        urlDiscount: action.payload,
        isApplied: false,
        error: null,
        bannerDismissed: false,
        alreadyApplied: false
      }

    case "START_APPLYING":
      return {
        ...state,
        isApplying: true,
        error: null
      }

    case "APPLY_SUCCESS":
      return {
        ...state,
        isApplying: false,
        isApplied: true,
        error: null,
        alreadyApplied: action.payload?.alreadyApplied || false
      }

    case "APPLY_ERROR":
      return {
        ...state,
        isApplying: false,
        isApplied: false,
        error: action.payload
      }

    case "DISMISS_BANNER":
      return {
        ...state,
        bannerDismissed: true
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null
      }

    case "RESET":
      return initialState

    // Enhanced cases for comparison modal
    case "SHOW_COMPARISON_MODAL":
      return {
        ...state,
        showComparisonModal: true,
        comparisonData: action.payload.comparison,
        pendingDiscountCode: action.payload.pendingCode
      }

    case "HIDE_COMPARISON_MODAL":
      return {
        ...state,
        showComparisonModal: false,
        comparisonData: null,
        pendingDiscountCode: null
      }

    case "SET_PENDING_DISCOUNT":
      return {
        ...state,
        pendingDiscountCode: action.payload
      }

    case "CLEAR_PENDING_DISCOUNT":
      return {
        ...state,
        pendingDiscountCode: null
      }

    default:
      return state
  }
}

// Create context
const DiscountContext = createContext<DiscountContextValue | undefined>(undefined)

// Provider props interface
interface DiscountProviderProps {
  children: ReactNode
}

// Provider component
export function DiscountProvider({ children }: DiscountProviderProps) {
  const [state, dispatch] = useReducer(discountReducer, initialState)

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any pending states on unmount
      dispatch({ type: "RESET" })
    }
  }, [])

  // Stable function references to prevent unnecessary re-renders
  const setUrlDiscount = useCallback((code: string) => {
    dispatch({ type: "SET_URL_DISCOUNT", payload: code })
  }, [])

  const applyUrlDiscount = useCallback(async (code: string) => {
    dispatch({ type: "START_APPLYING" })

    try {
      // Import cart functions dynamically to avoid circular dependencies
      const { applyUrlDiscountToCart } = await import("@lib/data/cart")

      const result = await applyUrlDiscountToCart(code)

      if (result.success) {
        if (result.alreadyApplied) {
          console.log('ℹ️ Discount already applied:', code)
          dispatch({ type: "APPLY_SUCCESS", payload: { alreadyApplied: true } })
        } else {
          console.log('✅ Discount applied successfully:', code)
          dispatch({ type: "APPLY_SUCCESS", payload: { alreadyApplied: false } })
        }
      } else {
        console.log('❌ Discount application failed:', result.error)
        dispatch({ type: "APPLY_ERROR", payload: result.error || "Failed to apply discount code" })
      }
    } catch (error) {
      console.error('💥 Error applying discount:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to apply discount code"

      dispatch({ type: "APPLY_ERROR", payload: errorMessage })
    }
  }, [])

  const dismissBanner = useCallback(() => {
    dispatch({ type: "DISMISS_BANNER" })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  // Enhanced methods for comparison modal
  const showComparisonModal = useCallback((comparison: DiscountComparison, pendingCode: string) => {
    dispatch({ type: "SHOW_COMPARISON_MODAL", payload: { comparison, pendingCode } })
  }, [])

  const hideComparisonModal = useCallback(() => {
    dispatch({ type: "HIDE_COMPARISON_MODAL" })
  }, [])

  const setPendingDiscount = useCallback((code: string) => {
    dispatch({ type: "SET_PENDING_DISCOUNT", payload: code })
  }, [])

  const clearPendingDiscount = useCallback(() => {
    dispatch({ type: "CLEAR_PENDING_DISCOUNT" })
  }, [])

  // Memoized context value to prevent unnecessary re-renders
  // Only re-create when state actually changes, not when functions change
  const contextValue = React.useMemo((): DiscountContextValue => ({
    ...state,
    setUrlDiscount,
    applyUrlDiscount,
    dismissBanner,
    clearError,
    reset,
    // Enhanced methods for comparison modal
    showComparisonModal,
    hideComparisonModal,
    setPendingDiscount,
    clearPendingDiscount
  }), [
    // Use the entire state object instead of individual properties
    // This reduces the number of dependencies and potential re-renders
    state,
    setUrlDiscount,
    applyUrlDiscount,
    dismissBanner,
    clearError,
    reset,
    showComparisonModal,
    hideComparisonModal,
    setPendingDiscount,
    clearPendingDiscount
  ])

  return (
    <DiscountContext.Provider value={contextValue}>
      {children}
    </DiscountContext.Provider>
  )
}

// Custom hook to use the discount context with optional fallback
export function useDiscountContext(): DiscountContextValue {
  const context = useContext(DiscountContext)

  if (context === undefined) {
    // Provide a fallback context for components outside the provider
    console.warn("useDiscountContext used outside DiscountProvider - providing fallback")
    return {
      ...initialState,
      setUrlDiscount: () => {},
      applyUrlDiscount: async () => {},
      dismissBanner: () => {},
      clearError: () => {},
      reset: () => {},
      // Enhanced methods for comparison modal
      showComparisonModal: () => {},
      hideComparisonModal: () => {},
      setPendingDiscount: () => {},
      clearPendingDiscount: () => {}
    }
  }

  return context
}
