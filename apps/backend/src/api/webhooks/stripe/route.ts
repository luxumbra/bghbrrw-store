import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

interface StripeWebhookRequest extends MedusaRequest {
  headers: {
    "stripe-signature"?: string
    [key: string]: string | string[] | undefined
  }
  body: any
}

interface PaymentModuleService {
  processWebhook?: (provider: string, data: { signature: string; body: any }) => Promise<void>
}

export const POST = async (
  req: StripeWebhookRequest,
  res: MedusaResponse
) => {
  const container = req.scope
  const logger = container.resolve("logger")
  const paymentModuleService = container.resolve(Modules.PAYMENT) as PaymentModuleService

  logger.info(`Received Stripe webhook - hasSignature: ${!!req.headers["stripe-signature"]}, bodyType: ${typeof req.body}, timestamp: ${new Date().toISOString()}`)

  const signature = req.headers["stripe-signature"]

  // Validate webhook signature
  if (!signature || typeof signature !== "string") {
    logger.error(`Invalid or missing Stripe signature - hasSignature: ${!!signature}, signatureType: ${typeof signature}`)
    return res.status(400).json({ 
      message: "Invalid webhook signature",
      error: "MISSING_SIGNATURE"
    })
  }

  // Validate request body
  if (!req.body) {
    logger.error("Missing webhook body")
    return res.status(400).json({ 
      message: "Invalid webhook payload",
      error: "MISSING_BODY"
    })
  }

  try {
    // Check if the payment module supports webhook processing
    if (!paymentModuleService.processWebhook) {
      logger.error("Payment module does not support webhook processing")
      return res.status(501).json({ 
        message: "Webhook processing not supported",
        error: "METHOD_NOT_AVAILABLE"
      })
    }

    // Process the webhook with the payment module
    await paymentModuleService.processWebhook("stripe", {
      signature,
      body: req.body,
    })

    logger.info(`Stripe webhook processed successfully - signature: ${signature.substring(0, 20)}..., timestamp: ${new Date().toISOString()}`)

    return res.status(200).json({ 
      message: "Webhook processed successfully",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorCode = error instanceof Error && 'code' in error ? error.code : "UNKNOWN_ERROR"
    
    logger.error(`Error processing Stripe webhook - error: ${errorMessage}, code: ${errorCode}, signature: ${signature.substring(0, 20)}..., timestamp: ${new Date().toISOString()}`)
    
    // Return appropriate HTTP status based on error type
    const statusCode = errorMessage.includes("signature") || errorMessage.includes("invalid") ? 400 : 500
    
    return res.status(statusCode).json({ 
      message: "Failed to process webhook",
      error: errorCode,
      details: errorMessage,
      timestamp: new Date().toISOString()
    })
  }
}