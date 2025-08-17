"use client"

import { useState, useCallback } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import type { 
  StripePaymentResult, 
  StripePaymentError, 
  UseStripePaymentReturn
} from '@/types/stripe'
import { 
  mapStripeErrorToPaymentError,
  isStripeError
} from '@/types/stripe'
import { placeOrder } from '@lib/data/cart'

/**
 * Custom hook for handling Stripe payment processing
 * Provides a clean interface for payment confirmation and error handling
 */
export const useStripePayment = (): UseStripePaymentReturn => {
  const stripe = useStripe()
  const elements = useElements()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<StripePaymentError | null>(null)

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  const confirmPayment = useCallback(async (): Promise<StripePaymentResult> => {
    if (!stripe || !elements) {
      const error: StripePaymentError = {
        type: 'unknown_error',
        message: 'Payment system not ready. Please try again.',
      }
      setError(error)
      return { success: false, error }
    }

    setLoading(true)
    setError(null)

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (stripeError) {
        const paymentError = mapStripeErrorToPaymentError(stripeError)
        setError(paymentError)
        return { success: false, error: paymentError }
      }

      if (!paymentIntent) {
        const error: StripePaymentError = {
          type: 'processing_error',
          message: 'Payment confirmation failed. Please try again.',
        }
        setError(error)
        return { success: false, error }
      }

      // Check payment intent status
      if (paymentIntent.status === 'succeeded') {
        // Place the order with Medusa
        try {
          await placeOrder()
          return { 
            success: true, 
            paymentIntent: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              client_secret: paymentIntent.client_secret || '',
            }
          }
        } catch (orderError) {
          const error: StripePaymentError = {
            type: 'processing_error',
            message: 'Payment succeeded but order creation failed. Please contact support.',
            payment_intent_id: paymentIntent.id,
          }
          setError(error)
          return { success: false, error }
        }
      } else if (paymentIntent.status === 'requires_action') {
        const error: StripePaymentError = {
          type: 'processing_error',
          message: 'Additional authentication is required. Please try again.',
          payment_intent_id: paymentIntent.id,
        }
        setError(error)
        return { success: false, error }
      } else {
        const error: StripePaymentError = {
          type: 'processing_error',
          message: `Payment ${paymentIntent.status}. Please try again.`,
          payment_intent_id: paymentIntent.id,
        }
        setError(error)
        return { success: false, error }
      }
    } catch (err) {
      console.error('Payment confirmation error:', err)
      
      let paymentError: StripePaymentError
      
      if (isStripeError(err)) {
        paymentError = mapStripeErrorToPaymentError(err)
      } else {
        paymentError = {
          type: 'network_error',
          message: 'Network error occurred. Please check your connection and try again.',
        }
      }
      
      setError(paymentError)
      return { success: false, error: paymentError }
    } finally {
      setLoading(false)
    }
  }, [stripe, elements])

  const canPay = Boolean(stripe && elements && !loading)

  return {
    confirmPayment,
    loading,
    error,
    canPay,
    reset,
  }
}

/**
 * Helper hook for getting Stripe instance status
 */
export const useStripeStatus = () => {
  const stripe = useStripe()
  const elements = useElements()
  
  return {
    isReady: Boolean(stripe && elements),
    stripe,
    elements,
  }
}