"use client"

import React, { Suspense } from "react"
import { DiscountProvider } from "../../../context/discount-context"
import DiscountUrlHandler from "../discount-url-handler"

/**
 * Client-side wrapper for discount functionality
 * This ensures that URL detection and discount handling only runs on the client
 */
const ClientDiscountWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DiscountProvider>
      <Suspense fallback={null}>
        <DiscountUrlHandler />
      </Suspense>
      {children}
    </DiscountProvider>
  )
}

export default ClientDiscountWrapper