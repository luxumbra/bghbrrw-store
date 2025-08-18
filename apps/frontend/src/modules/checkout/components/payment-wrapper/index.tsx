"use client"

import React, { useEffect } from "react"
import type { HttpTypes } from "@medusajs/types"
import { isStripe } from "@lib/constants"
import { getStripe, preloadStripe, validateStripeConfig } from "@lib/stripe/stripe-loader"
import DynamicStripeWrapper from "./dynamic-stripe-wrapper"
import { Alert, Text } from "@medusajs/ui"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const PaymentConfigError: React.FC<{ errors: string[] }> = ({ errors }) => (
  <Alert variant="error" className="mb-4">
    <div className="flex flex-col gap-2">
      <Text className="font-medium">Payment Configuration Error</Text>
      <div>
        {errors.map((error, index) => (
          <Text key={index} className="text-sm">• {error}</Text>
        ))}
      </div>
      <Text className="text-xs text-ui-fg-muted">
        Please contact support if this issue persists.
      </Text>
    </div>
  </Alert>
)

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  // Validate Stripe configuration on mount
  const configValidation = validateStripeConfig()
  
  useEffect(() => {
    // Preload Stripe if we have a valid configuration
    if (configValidation.isValid && isStripe(paymentSession?.provider_id)) {
      preloadStripe()
    }
  }, [configValidation.isValid, paymentSession?.provider_id])

  // Show configuration errors
  if (!configValidation.isValid) {
    return (
      <>
        <PaymentConfigError errors={configValidation.errors} />
        <div>{children}</div>
      </>
    )
  }

  // Use Stripe wrapper for Stripe payment sessions
  if (isStripe(paymentSession?.provider_id) && paymentSession) {
    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    const stripePromise = getStripe()
    
    return (
      <DynamicStripeWrapper
        paymentSession={paymentSession}
        stripeKey={stripeKey}
        stripePromise={stripePromise}
        onError={(error) => {
          console.error('Stripe integration error:', error)
        }}
        onInitialized={(stripe) => {
          console.log('Stripe initialized successfully')
        }}
      >
        {children}
      </DynamicStripeWrapper>
    )
  }

  return <div>{children}</div>
}

export default PaymentWrapper
