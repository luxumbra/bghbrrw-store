"use client"

import { Badge, Heading, Input, Label, Text } from "@medusajs/ui"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { InformationCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import { debounce } from "lodash"

// Define a type for the promotion that includes the properties we use
type Promotion = {
  id: string
  code?: string
  is_automatic?: boolean
  application_method?: {
    type: string
    value: number
    currency_code?: string
  }
}

// Using require to avoid type issues with the context
const { useSafeDiscountContext } = require("../../../../context/discount-context")

interface OptimizedDiscountCodeProps {
  promotions: Promotion[]
  onPromotionChange?: () => void
}

const OptimizedDiscountCode = React.memo(({ 
  promotions = [],
  onPromotionChange 
}: OptimizedDiscountCodeProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { urlDiscount, isApplied } = useSafeDiscountContext()

  // Memoize the promotion codes to prevent unnecessary re-renders
  const promotionCodes = useMemo(() => {
    return promotions
      .map(p => p.code)
      .filter((code): code is string => Boolean(code))
  }, [promotions])

  // Check if a promotion was applied from URL
  const isPromotionFromUrl = useCallback((promotionCode: string) => {
    return urlDiscount === promotionCode && isApplied
  }, [urlDiscount, isApplied])

  // Debounced function to remove promotion with proper typing
  const debouncedRemovePromotion = useMemo(() => 
    debounce(async (code: string) => {
      try {
        setIsApplying(true)
        const validPromotions = promotions
          .filter((p): p is Promotion & { code: string } => p.code !== undefined)
          .filter(p => p.code !== code)
          .map(p => p.code)

        await applyPromotions(validPromotions)
        onPromotionChange?.()
      } catch (err) {
        setError("Failed to remove promotion. Please try again.")
      } finally {
        setIsApplying(false)
      }
    }, 300), // 300ms debounce time
    [promotions, onPromotionChange]
  )

  // Wrapper function to use the debounced function
  const removePromotionCode = useCallback((code: string) => {
    debouncedRemovePromotion(code)
  }, [debouncedRemovePromotion])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const code = formData.get("code")?.toString().trim()
    
    if (!code) return

    try {
      setIsApplying(true)
      setError(null)
      
      const codes = [...promotionCodes, code]
      await applyPromotions(codes)
      onPromotionChange?.()
      
      // Reset form
      const input = e.currentTarget.querySelector('input[name="code"]') as HTMLInputElement
      if (input) input.value = ""
    } catch (err) {
      setError("Failed to apply promotion. Please check the code and try again.")
    } finally {
      setIsApplying(false)
    }
  }, [promotionCodes, onPromotionChange])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      // @ts-ignore - cancel exists on the debounced function
      debouncedRemovePromotion.cancel?.()
    }
  }, [debouncedRemovePromotion])

  return (
    <div className="flex flex-col w-full bg-primary-bg">
      <div className="txt-medium">
        <form onSubmit={handleSubmit} className="w-full mb-5">
          <Label className="flex items-center my-2 gap-x-1">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="add-discount-button"
            >
              {promotions.length > 0 ? "Add Another Promotion Code" : "Add Promotion Code"}
            </button>
          </Label>

          {isOpen && (
            <>
              <div className="flex w-full gap-x-2">
                <Input
                  className="flex-1"
                  name="code"
                  type="text"
                  placeholder="Enter promotion code"
                  disabled={isApplying}
                  data-testid="discount-input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-ui-fg-interactive hover:bg-ui-fg-interactive-hover rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isApplying}
                  data-testid="discount-apply-button"
                >
                  {isApplying ? "Applying..." : "Apply"}
                </button>
              </div>

              {error && (
                <div className="mt-2 text-sm text-red-500" data-testid="discount-error-message">
                  {error}
                </div>
              )}
            </>
          )}
        </form>

        {promotions.length > 0 && (
          <div className="space-y-2">
            <Heading level="h3" className="text-sm font-medium">
              Applied Promotions:
            </Heading>
            
            <div className="space-y-2">
              {promotions.map((promotion) => (
                <div 
                  key={promotion.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  data-testid="discount-row"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      color={
                        promotion.is_automatic 
                          ? "green" 
                          : isPromotionFromUrl(promotion.code!) 
                            ? "blue" 
                            : "grey"
                      }
                      size="small"
                    >
                      {promotion.code}
                    </Badge>
                    
                    {isPromotionFromUrl(promotion.code!) && (
                      <Badge color="purple" size="small">
                        From Link
                      </Badge>
                    )}
                    
                    {promotion.application_method?.value !== undefined && (
                      <div className="flex items-center gap-x-2">
                        <Text className="text-sm">
                          {promotion.application_method.type === "percentage"
                            ? `-${promotion.application_method.value}%`
                            : `-${convertToLocale({
                                amount: promotion.application_method.value,
                                currency_code: promotion.application_method.currency_code || "USD"
                              })}`
                          }
                        </Text>
                      </div>
                    )}
                  </div>
                  
                  {!promotion.is_automatic && promotion.code && (
                    <button
                      key={`remove-${promotion.id}`}
                      type="button"
                      onClick={() => removePromotionCode(promotion.code as string)}
                      disabled={isApplying}
                      className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      data-testid="remove-discount-button"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  if (prevProps.promotions.length !== nextProps.promotions.length) return false
  
  // Check if any promotion has changed
  return prevProps.promotions.every((promo, index) => 
    promo.id === nextProps.promotions[index]?.id &&
    promo.code === nextProps.promotions[index]?.code
  )
})

OptimizedDiscountCode.displayName = 'OptimizedDiscountCode'

export default OptimizedDiscountCode
