"use client"

import React, { Suspense, useEffect, useState } from "react"
import { DiscountProvider } from "@/context/discount-context"
import { ToastProvider } from "@modules/common/components/toast"
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

  return (
    <ToastProvider>
      <DiscountProvider>
        {isMounted && (
          <Suspense fallback={null}>
            <DiscountUrlHandler />
          </Suspense>
        )}
        {children}
      </DiscountProvider>
    </ToastProvider>
  )
}

export default React.memo(ClientDiscountWrapper)
