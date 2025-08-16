"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"
import type {ReactNode} from "react"

// State interface for discount management
interface DiscountState {
  urlDiscount: string | null
  isApplying: boolean
  isApplied: boolean
  error: string | null
  bannerDismissed: boolean
  alreadyApplied: boolean
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

// Context value interface
interface DiscountContextValue extends DiscountState {
  setUrlDiscount: (code: string) => void
  applyUrlDiscount: (code: string) => Promise<void>
  dismissBanner: () => void
  clearError: () => void
  reset: () => void
}

// Initial state
const initialState: DiscountState = {
  urlDiscount: null,
  isApplying: false,
  isApplied: false,
  error: null,
  bannerDismissed: false,
  alreadyApplied: false
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

  // Memoized context value to prevent unnecessary re-renders
  // Only re-create when state actually changes, not when functions change
  const contextValue = React.useMemo((): DiscountContextValue => ({
    ...state,
    setUrlDiscount,
    applyUrlDiscount,
    dismissBanner,
    clearError,
    reset
  }), [
    // Use the entire state object instead of individual properties
    // This reduces the number of dependencies and potential re-renders
    state,
    setUrlDiscount,
    applyUrlDiscount,
    dismissBanner,
    clearError,
    reset
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
      reset: () => {}
    }
  }

  return context
}
