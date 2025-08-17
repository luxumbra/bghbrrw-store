"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Spinner, Text } from '@medusajs/ui'
import { StripeWrapperProps } from '@/types/stripe'

/**
 * Loading component for Stripe wrapper
 */
const StripeLoadingFallback = () => (
  <div className="flex items-center justify-center p-12">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="large" />
      <div className="text-center">
        <Text className="font-medium mb-1">Loading Payment System</Text>
        <Text className="text-sm text-ui-fg-subtle">
          Initializing secure payment processing...
        </Text>
      </div>
    </div>
  </div>
)

/**
 * Error fallback for dynamic import failure
 */
const StripeDynamicError = () => (
  <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-center">
    <Text className="font-medium text-red-800 mb-2">
      Payment System Unavailable
    </Text>
    <Text className="text-sm text-red-600 mb-4">
      Failed to load the payment system. This might be due to network issues or browser restrictions.
    </Text>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Refresh Page
    </button>
  </div>
)

/**
 * Dynamically imported Stripe wrapper with code splitting
 * This reduces initial bundle size and improves page load performance
 */
const DynamicStripeWrapper = dynamic(
  () => import('./stripe-wrapper').then(mod => mod.default),
  {
    loading: () => <StripeLoadingFallback />,
    ssr: false, // Payment processing is client-side only
  }
)

/**
 * Enhanced wrapper with error boundary and loading states
 */
const DynamicStripeWrapperWithBoundary: React.FC<StripeWrapperProps> = (props) => {
  return (
    <Suspense fallback={<StripeLoadingFallback />}>
      <DynamicStripeWrapper {...props} />
    </Suspense>
  )
}

export default DynamicStripeWrapperWithBoundary