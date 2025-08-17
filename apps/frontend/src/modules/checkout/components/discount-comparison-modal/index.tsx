"use client"

import React from "react"
import { Badge, Button, Text, Heading } from "@medusajs/ui"
import Modal from "@modules/common/components/modal"
import { convertToLocale } from "@lib/util/money"

interface DiscountComparison {
  currentValue: number
  newValue: number
  difference: number
  isBetter: boolean
  isSignificantlyBetter: boolean
  currentCode: string
  newCode: string
}

interface DiscountComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  comparison: DiscountComparison
  currencyCode: string
  onKeepCurrent: () => void
  onApplyNew: () => void
  isLoading?: boolean
}

const DiscountComparisonModal: React.FC<DiscountComparisonModalProps> = ({
  isOpen,
  onClose,
  comparison,
  currencyCode,
  onKeepCurrent,
  onApplyNew,
  isLoading = false
}) => {
  const formatValue = (amount: number) => {
    return convertToLocale({
      amount: Math.round(amount * 100), // Convert to cents
      currency_code: currencyCode,
    })
  }

  const handleKeepCurrent = () => {
    onKeepCurrent()
    onClose()
  }

  const handleApplyNew = () => {
    onApplyNew()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} close={onClose} size="medium" data-testid="discount-comparison-modal">
      <Modal.Title>
        Replace Discount Code?
      </Modal.Title>
      
      <Modal.Body>
        <div className="space-y-6">
          <Text className="text-ui-fg-subtle">
            You already have a discount code applied. Would you like to replace it with the new one?
          </Text>

          {/* Current Discount */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <Heading level="h4" className="text-sm font-medium text-gray-900">
                Current Discount
              </Heading>
              <Badge color="grey" size="small">
                {comparison.currentCode}
              </Badge>
            </div>
            <div className="text-lg font-semibold text-green-600">
              -{formatValue(comparison.currentValue)}
            </div>
          </div>

          {/* New Discount */}
          <div className={`p-4 border rounded-lg ${
            comparison.isBetter ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Heading level="h4" className="text-sm font-medium text-gray-900">
                New Discount
              </Heading>
              <Badge 
                color={comparison.isBetter ? "green" : "red"} 
                size="small"
              >
                {comparison.newCode}
              </Badge>
            </div>
            <div className={`text-lg font-semibold ${
              comparison.isBetter ? "text-green-600" : "text-red-600"
            }`}>
              -{formatValue(comparison.newValue)}
            </div>
          </div>

          {/* Comparison */}
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <Text className="font-medium">
                {comparison.isBetter ? "You'll save" : "You'll lose"}
              </Text>
              <Text className={`font-semibold ${
                comparison.isBetter ? "text-green-600" : "text-red-600"
              }`}>
                {comparison.isBetter ? "+" : "-"}{formatValue(comparison.difference)} extra
              </Text>
            </div>
          </div>

          {/* Recommendation */}
          {comparison.isSignificantlyBetter && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
              <Text className="text-sm text-green-800 font-medium">
                💡 Recommended: The new discount saves you significantly more!
              </Text>
            </div>
          )}

          {!comparison.isBetter && (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <Text className="text-sm text-yellow-800 font-medium">
                ⚠️ Your current discount is better. Consider keeping it.
              </Text>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            onClick={handleKeepCurrent}
            disabled={isLoading}
            className="flex-1"
            data-testid="keep-current-discount-button"
          >
            Keep {comparison.currentCode}
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyNew}
            disabled={isLoading}
            className="flex-1"
            data-testid="apply-new-discount-button"
          >
            {isLoading ? "Applying..." : `Apply ${comparison.newCode}`}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default DiscountComparisonModal