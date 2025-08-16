"use client"

import React, { Suspense, useEffect, useState } from "react"
import { DiscountProvider } from "@/context/discount-context"
import DiscountUrlHandler from "@/components/common/discount-url-handler"

/**
 * Client-side wrapper for discount functionality
 * This ensures that URL detection and discount handling only runs on the client
 */
const ClientDiscountWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)

  // Use a more reliable way to detect client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only render the discount provider and handler on the client side
  // This prevents any server-side rendering of discount-related components
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <DiscountProvider>
      <Suspense fallback={null}>
        <DiscountUrlHandler />
      </Suspense>
      {children}
    </DiscountProvider>
  )
}

export default React.memo(ClientDiscountWrapper)
