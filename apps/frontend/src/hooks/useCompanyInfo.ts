"use client"

import { useState, useEffect } from 'react'
import type { CompanyInfo } from '@/lib/data/company'
import { STORE_NAME, STORE_EMAIL } from '@/lib/constants'
import { sdk } from '@/lib/config'

/**
 * Client-side hook to fetch company information
 * Use this in client components where getCompanyInfo() cannot be used
 * 
 * Fallback hierarchy:
 * 1. API response from /store/company-info
 * 2. Environment variables (NEXT_PUBLIC_STORE_NAME, NEXT_PUBLIC_STORE_EMAIL)
 * 3. Constants fallback
 * 4. Empty string for name if all fail
 */
export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await sdk.client.fetch<{ company: CompanyInfo }>("/store/company-info")
        setCompanyInfo(data.company)
      } catch (err) {
        console.error('Error fetching company info:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Fallback to constants if fetch fails
        setCompanyInfo({
          name: STORE_NAME || "",
          email: STORE_EMAIL || ""
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyInfo()
  }, [])

  return { companyInfo, loading, error }
}

/**
 * Simple hook that returns just the store name
 * Convenience hook for when you only need the store name
 */
export const useStoreName = () => {
  const { companyInfo, loading } = useCompanyInfo()
  
  return {
    storeName: companyInfo?.name || "",
    loading
  }
}