import Medusa from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
// Use NEXT_PUBLIC_ for client-side access, fallback to server-side env var
let MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

// Debug logging to help troubleshoot environment issues
if (typeof window !== 'undefined') {
  console.log('🔧 Medusa SDK Config:', {
    baseUrl: MEDUSA_BACKEND_URL,
    environment: process.env.NODE_ENV,
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.substring(0, 10) + '...'
  })
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
