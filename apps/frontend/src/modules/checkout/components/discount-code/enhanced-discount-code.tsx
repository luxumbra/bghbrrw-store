"use client"

import { Badge, Heading, Input, Label, Text, Button } from "@medusajs/ui"
import React, { useCallback, useEffect, useState } from "react"
import { InformationCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import { useDiscountContext } from "@/context/discount-context"
import {
  validateDiscountCode,
  getDiscountComparison,
  calculateDiscountValue,
  replaceDiscountAsync,
  applyPromotions
} from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import DiscountComparisonModal from "../discount-comparison-modal"
import { useSuccessToast, useErrorToast, useToast } from "@modules/common/components/toast"

type EnhancedDiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  onCartUpdate?: () => void
}

const EnhancedDiscountCode: React.FC<EnhancedDiscountCodeProps> = ({
  cart,
  onCartUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Hooks for toast notifications
  const showSuccessToast = useSuccessToast()
  const showErrorToast = useErrorToast()

  // Enhanced discount context
  const {
    urlDiscount,
    isApplied,
    showComparisonModal,
    hideComparisonModal,
    comparisonData,
    showComparisonModal: isComparisonModalOpen
  } = useDiscountContext()

  const { items = [], promotions = [] } = cart

  // Check if a promotion was applied from URL
  const isPromotionFromUrl = useCallback((promotionCode: string) => {
    return urlDiscount === promotionCode && isApplied
  }, [urlDiscount, isApplied])

  // Get existing promotion codes
  const existingCodes = promotions
    .filter(p => p.code && !p.is_automatic)
    .map(p => p.code!)

  // Calculate cart subtotal for discount comparisons
  const cartSubtotal = cart.subtotal || 0

  // Enhanced discount application with validation-first approach
  const handleApplyDiscount = useCallback(async (code: string) => {
    const normalizedCode = code.trim().toUpperCase()

    if (!normalizedCode) {
      showErrorToast("Please enter a discount code")
      return
    }

    setIsApplying(true)

    try {
      // Check if code is already applied
      if (existingCodes.includes(normalizedCode)) {
        showErrorToast("This discount code is already applied")
        setIsApplying(false)
        return
      }

      // If no existing discounts, apply directly
      if (existingCodes.length === 0) {
        const validation = await validateDiscountCode(normalizedCode)

        if (!validation.isValid) {
          showErrorToast(validation.error || "Invalid discount code")
          setIsApplying(false)
          return
        }

        // Apply the discount
        await applyPromotions([normalizedCode])

        showSuccessToast(`Discount ${normalizedCode} applied successfully!`)
        setInputValue("")
        onCartUpdate?.()
        setIsApplying(false)
        return
      }

      // If existing discounts, validate and compare
      const validation = await validateDiscountCode(normalizedCode)

      if (!validation.isValid) {
        // CRITICAL: Preserve existing discount when invalid code is entered
        showErrorToast(
          `Invalid discount code. Your current discount ${existingCodes[0]} is still applied.`
        )
        setIsApplying(false)
        return
      }

      // Get current discount for comparison
      const currentDiscount = promotions.find(p => p.code && !p.is_automatic)

      if (currentDiscount && validation.discountValue !== undefined) {
        const comparison = getDiscountComparison(
          currentDiscount,
          {
            code: normalizedCode,
            discountValue: validation.discountValue,
            discountType: validation.discountType || 'fixed'
          },
          cartSubtotal
        )

        // Auto-apply if significantly better (£2+ improvement)
        if (comparison.isSignificantlyBetter) {
          await replaceDiscountAsync(normalizedCode, existingCodes)

          showSuccessToast(
            `Applied better discount! ${normalizedCode} replaced ${comparison.currentCode}. You saved an extra £${comparison.difference.toFixed(2)}`
          )
          setInputValue("")
          onCartUpdate?.()
          setIsApplying(false)
          return
        }

        // Show comparison modal for other cases
        showComparisonModal(comparison, normalizedCode)
        setIsApplying(false)
        return
      }

      // Fallback: apply the new discount
      await replaceDiscountAsync(normalizedCode, existingCodes)
      showSuccessToast(`Discount ${normalizedCode} applied successfully!`)
      setInputValue("")
      onCartUpdate?.()
    } catch (error: any) {
      console.error("Error applying discount:", error)
      showErrorToast(
        existingCodes.length > 0
          ? `Could not apply discount code. Your current discount ${existingCodes[0]} is still applied.`
          : "Could not apply discount code. Please try again."
      )
    } finally {
      setIsApplying(false)
    }
  }, [existingCodes, promotions, cartSubtotal, showErrorToast, showSuccessToast, showComparisonModal, onCartUpdate])

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleApplyDiscount(inputValue.trim())
    }
  }, [inputValue, handleApplyDiscount])

  // Remove promotion code
  const removePromotionCode = useCallback(async (code: string) => {
    try {
      setIsApplying(true)
      const validPromotions = existingCodes.filter(existingCode => existingCode !== code)
      await applyPromotions(validPromotions)
      showSuccessToast(`Discount ${code} removed`)
      onCartUpdate?.()
    } catch (error) {
      showErrorToast("Failed to remove discount. Please try again.")
    } finally {
      setIsApplying(false)
    }
  }, [existingCodes, showSuccessToast, showErrorToast, onCartUpdate])

  // Handle comparison modal decisions
  const handleKeepCurrentDiscount = useCallback(() => {
    // Just close the modal, keep existing discount
    hideComparisonModal()
  }, [hideComparisonModal])

  const handleApplyNewDiscount = useCallback(async () => {
    if (!comparisonData) return

    setIsApplying(true)
    try {
      await replaceDiscountAsync(comparisonData.newCode, existingCodes)

      const improvement = comparisonData.isBetter
        ? ` You saved an extra £${comparisonData.difference.toFixed(2)}`
        : ` You chose ${comparisonData.newCode} over ${comparisonData.currentCode}`

      showSuccessToast(`Discount ${comparisonData.newCode} applied!${improvement}`)
      setInputValue("")
      onCartUpdate?.()
    } catch (error) {
      showErrorToast("Failed to apply new discount. Please try again.")
    } finally {
      setIsApplying(false)
      hideComparisonModal()
    }
  }, [comparisonData, existingCodes, showSuccessToast, showErrorToast, onCartUpdate, hideComparisonModal])

  return (
    <>
      <div className="flex flex-col w-full bg-primary-bg">
        <div className="txt-medium">
          {/* Discount Code Form */}
          <form onSubmit={handleSubmit} className="w-full mb-5">
            <Label className="flex items-center my-2 gap-x-1">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="add-discount-button"
              >
                {promotions.length > 0 ? "Use a different discount code" : "Add a discount code"}
              </button>
            </Label>

            {isOpen && (
              <>
                <div className="flex w-full gap-x-2">
                  <Input
                    className="flex-1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter discount code"
                    disabled={isApplying}
                    data-testid="discount-input"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isApplying || !inputValue.trim()}
                    data-testid="discount-apply-button"
                  >
                    {isApplying ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Applied Promotions Display */}
          {promotions.length > 0 && (
            <div className="flex items-center w-full">
              <div className="flex flex-col w-full">
                <Heading className="mb-2 txt-medium">
                  Discount{promotions.length > 1 ? "s" : ""} applied:
                </Heading>

                {promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2"
                    data-testid="discount-row"
                  >
                    <Text className="flex items-baseline w-4/5 pr-1 gap-x-1 txt-small-plus">
                      <span className="truncate" data-testid="discount-code">
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
                        </Badge>{" "}

                        {isPromotionFromUrl(promotion.code!) && (
                          <Badge color="purple" size="small" className="ml-1">
                            From Link
                          </Badge>
                        )}{" "}

                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !== undefined && (
                            <>
                              (
                              {promotion.application_method.type === "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: Number(promotion.application_method.value),
                                    currency_code: promotion.application_method.currency_code,
                                  })}
                              )
                            </>
                          )}

                        {isPromotionFromUrl(promotion.code!) && (
                          <InformationCircleSolid
                            className="inline text-blue-400 ml-1"
                            size={12}
                            title="This discount was applied automatically from a link"
                          />
                        )}
                      </span>
                    </Text>

                    {!promotion.is_automatic && promotion.code && (
                      <button
                        className="flex items-center"
                        onClick={() => removePromotionCode(promotion.code!)}
                        disabled={isApplying}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      {isComparisonModalOpen && comparisonData && (
        <DiscountComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={hideComparisonModal}
          comparison={comparisonData}
          currencyCode={cart.currency_code || "GBP"}
          onKeepCurrent={handleKeepCurrentDiscount}
          onApplyNew={handleApplyNewDiscount}
          isLoading={isApplying}
        />
      )}
    </>
  )
}

export default EnhancedDiscountCode