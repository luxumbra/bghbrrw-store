import { Stripe, StripeElements, StripeError } from '@stripe/stripe-js'
import { HttpTypes } from '@medusajs/types'

/**
 * Stripe Integration Types
 * Provides type safety for Stripe payment components
 */

export interface StripePaymentSession extends HttpTypes.StorePaymentSession {
  data: {
    client_secret: string
    [key: string]: any
  }
}

export interface StripeConfiguration {
  publishableKey: string
  secretKey?: string
  webhookSecret?: string
}

export interface StripeInitializationState {
  stripe: Stripe | null
  elements: StripeElements | null
  loading: boolean
  error: string | null
  initialized: boolean
}

export interface StripePaymentError {
  type: 'validation_error' | 'card_error' | 'processing_error' | 'network_error' | 'unknown_error'
  message: string
  code?: string
  decline_code?: string
  payment_intent_id?: string
}

export interface StripePaymentResult {
  success: boolean
  error?: StripePaymentError
  paymentIntent?: {
    id: string
    status: string
    client_secret: string
  }
}

export interface StripeWebhookPayload {
  signature: string
  body: any
  timestamp: number
}

export interface StripeWebhookResponse {
  success: boolean
  message: string
  error?: string
  details?: string
  timestamp: string
}

/**
 * Component Props Types
 */

export interface StripeWrapperProps {
  paymentSession: HttpTypes.StorePaymentSession
  stripeKey?: string
  stripePromise: Promise<Stripe | null> | null
  children: React.ReactNode
  onError?: (error: StripePaymentError) => void
  onInitialized?: (stripe: Stripe) => void
}

export interface PaymentFormProps {
  paymentSession: StripePaymentSession
  onPaymentSuccess?: (result: StripePaymentResult) => void
  onPaymentError?: (error: StripePaymentError) => void
  disabled?: boolean
  loading?: boolean
}

export interface PaymentButtonProps {
  disabled?: boolean
  loading?: boolean
  onPayment: () => Promise<void>
  children?: React.ReactNode
  className?: string
  testId?: string
}

/**
 * Hook Return Types
 */

export interface UseStripePaymentReturn {
  confirmPayment: () => Promise<StripePaymentResult>
  loading: boolean
  error: StripePaymentError | null
  canPay: boolean
  reset: () => void
}

export interface UseStripeInitializationReturn extends StripeInitializationState {
  retry: () => void
  retryCount: number
}

/**
 * Utility Types
 */

export type StripeElementType = 
  | 'card'
  | 'cardNumber'
  | 'cardExpiry'
  | 'cardCvc'
  | 'payment'

export type StripeAppearanceTheme = 'stripe' | 'night' | 'flat'

export interface StripeElementsAppearance {
  theme?: StripeAppearanceTheme
  variables?: {
    colorPrimary?: string
    colorBackground?: string
    colorText?: string
    colorDanger?: string
    colorWarning?: string
    fontFamily?: string
    spacingUnit?: string
    borderRadius?: string
  }
  rules?: {
    [key: string]: {
      [property: string]: string
    }
  }
}

/**
 * Error Mapping Utilities
 */

export const mapStripeErrorToPaymentError = (stripeError: StripeError): StripePaymentError => {
  switch (stripeError.type) {
    case 'card_error':
      return {
        type: 'card_error',
        message: stripeError.message || 'Your card was declined.',
        code: stripeError.code,
        decline_code: stripeError.decline_code,
      }
    case 'validation_error':
      return {
        type: 'validation_error',
        message: stripeError.message || 'Invalid payment information.',
        code: stripeError.code,
      }
    case 'processing_error':
      return {
        type: 'processing_error',
        message: 'A processing error occurred. Please try again.',
        code: stripeError.code,
      }
    default:
      return {
        type: 'unknown_error',
        message: stripeError.message || 'An unexpected error occurred.',
        code: stripeError.code,
      }
  }
}

/**
 * Validation Utilities
 */

export const isValidStripePaymentSession = (
  session: HttpTypes.StorePaymentSession
): session is StripePaymentSession => {
  return !!(
    session?.data &&
    typeof session.data === 'object' &&
    'client_secret' in session.data &&
    typeof session.data.client_secret === 'string' &&
    session.data.client_secret.length > 0
  )
}

export const isStripeError = (error: any): error is StripeError => {
  return error && typeof error === 'object' && 'type' in error
}