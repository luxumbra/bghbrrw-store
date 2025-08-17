"use client"

import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"
import { createContext, useState, useEffect } from "react"
import { Alert, Spinner, Text } from "@medusajs/ui"
import PaymentErrorBoundary from "@modules/checkout/components/payment-error-boundary"
import { 
  StripeWrapperProps, 
  StripePaymentSession, 
  StripeElementsAppearance,
  isValidStripePaymentSession 
} from "@/types/stripe"

export const StripeContext = createContext(false)

interface StripeErrorProps {
  message: string
  retry?: () => void
}

const StripeError: React.FC<StripeErrorProps> = ({ message, retry }) => (
  <Alert variant="error" className="mb-4">
    <div className="flex flex-col gap-2">
      <Text className="font-medium">Payment System Error</Text>
      <Text className="text-sm">{message}</Text>
      {retry && (
        <button
          onClick={retry}
          className="text-sm underline hover:no-underline self-start"
        >
          Try again
        </button>
      )}
    </div>
  </Alert>
)

const StripeLoading: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <Spinner />
      <Text className="text-sm text-ui-fg-subtle">Loading payment system...</Text>
    </div>
  </div>
)

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
  onError,
  onInitialized,
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const validateAndInitialize = async () => {
    setLoading(true)
    setError(null)

    try {
      // Validate environment configuration
      if (!stripeKey) {
        throw new Error(
          "Payment system configuration error. Please contact support if this persists."
        )
      }

      if (!stripePromise) {
        throw new Error(
          "Payment system initialization failed. Please refresh the page and try again."
        )
      }

      if (!isValidStripePaymentSession(paymentSession)) {
        throw new Error(
          "Payment session expired. Please refresh the page to create a new payment session."
        )
      }

      // Initialize Stripe
      const stripeInstance = await stripePromise
      if (!stripeInstance) {
        throw new Error(
          "Failed to load payment system. Please check your internet connection and try again."
        )
      }

      setStripe(stripeInstance)
      onInitialized?.(stripeInstance)
    } catch (err) {
      console.error("Stripe initialization error:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown payment system error occurred."
      setError(errorMessage)
      
      // Call error callback if provided
      onError?.({
        type: 'unknown_error',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    validateAndInitialize()
  }, [stripeKey, stripePromise, paymentSession, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  if (loading) {
    return <StripeLoading />
  }

  if (error) {
    return <StripeError message={error} retry={handleRetry} />
  }

  if (!stripe) {
    return (
      <StripeError 
        message="Payment system could not be initialized. Please try refreshing the page." 
        retry={handleRetry}
      />
    )
  }

  const options: StripeElementsOptions = {
    clientSecret: paymentSession.data.client_secret as string,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#424770',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
      },
    },
  }

  return (
    <PaymentErrorBoundary>
      <StripeContext.Provider value={true}>
        <Elements options={options} stripe={stripe}>
          {children}
        </Elements>
      </StripeContext.Provider>
    </PaymentErrorBoundary>
  )
}

export default StripeWrapper
