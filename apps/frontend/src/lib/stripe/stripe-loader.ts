"use client"

import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import type { StripeConfiguration } from '@/types/stripe'

/**
 * Stripe Loader with caching and error handling
 * Provides optimized Stripe initialization with lazy loading
 */

let stripePromise: Promise<Stripe | null> | null = null
let stripeInstance: Stripe | null = null

interface StripeLoaderOptions {
  locale?: 'auto' | 'en' | 'ar' | 'bg' | 'cs' | 'da' | 'de' | 'el' | 'en-AU' | 'en-CA' | 'en-NZ' | 'en-GB' | 'es' | 'es-ES' | 'es-419' | 'et' | 'fi' | 'fil' | 'fr' | 'fr-CA' | 'fr-FR' | 'he' | 'hr' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'lt' | 'lv' | 'ms' | 'mt' | 'nb' | 'nl' | 'pl' | 'pt' | 'pt-BR' | 'ro' | 'ru' | 'sk' | 'sl' | 'sv' | 'th' | 'tr' | 'vi' | 'zh' | 'zh-HK' | 'zh-TW'
  stripeAccount?: string
  timeout?: number
}

/**
 * Get Stripe configuration from environment
 */
export const getStripeConfig = (): StripeConfiguration => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    throw new Error(
      'Stripe publishable key is missing. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.'
    )
  }

  return {
    publishableKey,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  }
}

/**
 * Load Stripe with caching and optimizations
 */
export const getStripe = (options: StripeLoaderOptions = {}): Promise<Stripe | null> => {
  // Return cached instance if available
  if (stripeInstance) {
    return Promise.resolve(stripeInstance)
  }

  // Return existing promise if loading
  if (stripePromise) {
    return stripePromise
  }

  try {
    const config = getStripeConfig()
    
    // Create new promise with timeout
    stripePromise = loadStripeWithTimeout(config.publishableKey, {
      locale: options.locale || 'en-GB', // Default to UK locale for Bough & Burrow
      stripeAccount: options.stripeAccount,
    }, options.timeout || 10000)

    // Cache the instance when loaded
    stripePromise.then((stripe) => {
      if (stripe) {
        stripeInstance = stripe
      }
      return stripe
    }).catch((error) => {
      console.error('Failed to load Stripe:', error)
      // Reset promise on error so retry is possible
      stripePromise = null
      throw error
    })

    return stripePromise
  } catch (error) {
    console.error('Stripe configuration error:', error)
    throw error
  }
}

/**
 * Load Stripe with timeout
 */
const loadStripeWithTimeout = (
  publishableKey: string,
  options: Parameters<typeof loadStripe>[1],
  timeout: number
): Promise<Stripe | null> => {
  return Promise.race([
    loadStripe(publishableKey, options),
    new Promise<null>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Stripe loading timeout after ${timeout}ms`))
      }, timeout)
    })
  ])
}

/**
 * Preload Stripe for better performance
 * Call this on pages where payment will likely be needed
 */
export const preloadStripe = (options: StripeLoaderOptions = {}): void => {
  if (typeof window !== 'undefined' && !stripePromise) {
    // Preload in next tick to avoid blocking
    setTimeout(() => {
      getStripe(options).catch(() => {
        // Silently fail preload, user will see error when actually needed
      })
    }, 0)
  }
}

/**
 * Reset Stripe instance (for testing or error recovery)
 */
export const resetStripe = (): void => {
  stripePromise = null
  stripeInstance = null
}

/**
 * Check if Stripe is ready
 */
export const isStripeReady = (): boolean => {
  return Boolean(stripeInstance)
}

/**
 * Validate Stripe configuration
 */
export const validateStripeConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  try {
    const config = getStripeConfig()
    
    if (!config.publishableKey.startsWith('pk_')) {
      errors.push('Invalid Stripe publishable key format')
    }

    if (config.publishableKey.includes('test') && process.env.NODE_ENV === 'production') {
      errors.push('Test Stripe key detected in production environment')
    }

  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message)
    } else {
      errors.push('Unknown configuration error')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}