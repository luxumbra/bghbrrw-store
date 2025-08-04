import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

interface StripeWebhookRequest extends MedusaRequest {
  headers: {
    "stripe-signature"?: string
    [key: string]: string | string[] | undefined
  }
  body: any
}

export const POST = async (
  req: StripeWebhookRequest,
  res: MedusaResponse
) => {
  const container = req.scope
  const logger = container.resolve("logger")
  const paymentModuleService = container.resolve(Modules.PAYMENT)

  logger.info("Received Stripe webhook")

  const signature = req.headers["stripe-signature"]

  if (!signature || typeof signature !== "string") {
    logger.error("No Stripe signature found")
    return res.status(400).json({ message: "No signature found" })
  }

  try {
    // Let the payment module handle the webhook
    // @ts-ignore - processWebhook method availability in Medusa Payment module
    await paymentModuleService.processWebhook("stripe", {
      signature,
      body: req.body,
    })

    return res.status(200).json({ message: "Webhook processed" })
  } catch (error) {
    logger.error("Error processing Stripe webhook:", error)
    return res.status(400).json({ 
      message: "Failed to process webhook",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}