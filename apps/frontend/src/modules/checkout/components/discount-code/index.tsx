"use client"

import { Badge, Heading, Input, Label, Text } from "@medusajs/ui"
import React, { useActionState, useEffect, useState } from "react"

import { applyPromotions, submitPromotionForm } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { InformationCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"
import { useDiscountContext } from "@/context/discount-context"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Ensure this component only renders on the client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only access the discount context on the client side
  const { urlDiscount, isApplied } = useDiscountContext()

  const { items = [], promotions = [] } = cart

  // Check if a promotion was applied from URL
  const isPromotionFromUrl = (promotionCode: string) => {
    return urlDiscount === promotionCode && isApplied
  }
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code === undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code === undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    await applyPromotions(codes)

    if (input) {
      input.value = ""
    }
  }

  const [message, formAction] = useActionState(submitPromotionForm, null)

  return (
    <div className="flex flex-col w-full bg-primary-bg">
      <div className="txt-medium">
        <form action={(a) => addPromotionCode(a)} className="w-full mb-5">
          <Label className="flex items-center my-2 gap-x-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="add-discount-button"
            >
              Add Promotion Code(s)
            </button>

            {/* <Tooltip content="You can add multiple promotion codes">
              <InformationCircleSolid color="var(--fg-muted)" />
            </Tooltip> */}
          </Label>

          {isOpen && (
            <>
              <div className="flex w-full gap-x-2">
                <Input
                  className="size-full"
                  id="promotion-input"
                  name="code"
                  type="text"
                  autoFocus={false}
                  data-testid="discount-input"
                />
                <SubmitButton
                  variant="secondary"
                  data-testid="discount-apply-button"
                >
                  Apply
                </SubmitButton>
              </div>

              <ErrorMessage
                error={message}
                data-testid="discount-error-message"
              />
            </>
          )}
        </form>

        {promotions.length > 0 && (
          <div className="flex items-center w-full">
            <div className="flex flex-col w-full">
              <Heading className="mb-2 txt-medium">
                Promotion(s) applied:
              </Heading>

              {promotions.map((promotion) => {
                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2"
                    data-testid="discount-row"
                  >
                    <Text className="flex items-baseline w-4/5 pr-1 gap-x-1 txt-small-plus">
                      <span className="truncate" data-testid="discount-code">
                        <Badge
                          color={promotion.is_automatic ? "green" : isPromotionFromUrl(promotion.code!) ? "blue" : "grey"}
                          size="small"
                        >
                          {promotion.code}
                        </Badge>{" "}
                        {isPromotionFromUrl(promotion.code!) && (
                          <Badge
                            color="purple"
                            size="small"
                            className="ml-1"
                          >
                            From Link
                          </Badge>
                        )}{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: Number(promotion.application_method.value),
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                        {isPromotionFromUrl(promotion.code!) && (
                          <InformationCircleSolid
                            className="inline text-blue-400 ml-1"
                            size={12}
                            title="This discount was applied automatically from a link"
                          />
                        )}
                      </span>
                    </Text>
                    {!promotion.is_automatic && (
                      <button
                        className="flex items-center"
                        onClick={() => {
                          if (!promotion.code) {
                            return
                          }

                          removePromotionCode(promotion.code)
                        }}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
