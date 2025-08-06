"use client"

import React, { useEffect, useCallback, useMemo, useState } from "react"
import X from "@modules/common/icons/x"

type BannerStatus = "pending" | "success" | "error"

interface DiscountBannerProps {
  discountCode: string
  status: BannerStatus
  error?: string | null
  alreadyApplied?: boolean
  onDismiss: () => void
  onRetry?: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

const DiscountBanner: React.FC<DiscountBannerProps> = ({
  discountCode,
  status,
  error,
  alreadyApplied = false,
  onDismiss,
  onRetry,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  // Ensure client-side only rendering to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-dismiss timer with proper cleanup
  useEffect(() => {
    if (status === "success" && autoHide) {
      const timer = setTimeout(() => {
        onDismiss()
      }, autoHideDelay)

      // Cleanup timer on unmount or dependency change
      return () => clearTimeout(timer)
    }
    // Don't auto-dismiss error states - let user manually dismiss
  }, [status, autoHide, autoHideDelay, onDismiss])

  // Keyboard event handler for dismiss
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onDismiss()
    }
  }, [onDismiss])

  // Stable reference to prevent unnecessary re-renders
  const handleDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry()
    }
  }, [onRetry])

  // Memoize expensive calculations to prevent re-computation on every render
  const bannerStyles = useMemo(() => {
    switch (status) {
      case "success":
        return "bg-green-50/40 backdrop-blur-md border-green-200 text-green-800"
      case "error":
        return "bg-red-50/40 backdrop-blur-md border-red-200 text-red-800"
      case "pending":
      default:
        return "bg-blue-50/40 backdrop-blur-md border-blue-200 text-blue-800"
    }
  }, [status])

  const bannerContent = useMemo(() => {
    switch (status) {
      case "success":
        if (alreadyApplied) {
          return {
            icon: "ℹ️",
            message: `Discount code '${discountCode}' is already applied to your cart.`
          }
        }
        return {
          icon: "🎉",
          message: `Discount code '${discountCode}' has been applied to your cart!`
        }
      case "error":
        return {
          icon: "❌",
          message: error || `Discount code '${discountCode}' is not valid or has expired.`
        }
      case "pending":
      default:
        return {
          icon: "⏳",
          message: `Applying discount code '${discountCode}'...`
        }
    }
  }, [status, discountCode, error, alreadyApplied])

  const { icon, message } = bannerContent

  // Prevent hydration mismatch by only rendering on client
  if (!isClient) {
    return null
  }

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-50 border-b p-4 transition-all duration-300 ${bannerStyles}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between gap-4 mx-auto max-w-7xl">
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <span className="flex-shrink-0 text-lg" aria-hidden="true">
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {message}
            </p>
            {status === "success" && (
              <p className="mt-1 text-xs opacity-75">
                You'll see the discount applied at checkout.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center flex-shrink-0 gap-2">
          {status === "error" && onRetry && (
            <button
              onClick={handleRetry}
              className="px-2 py-1 text-xs font-medium underline rounded hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label={`Retry applying discount code ${discountCode}`}
            >
              Retry
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="flex items-center justify-center w-6 h-6 transition-colors rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
            aria-label="Dismiss banner"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(DiscountBanner)
