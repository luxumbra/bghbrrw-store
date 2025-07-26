import { Modules } from "@medusajs/framework/utils"
import { Router } from "express"
import { ConfigModule } from "@medusajs/medusa"

const router = Router()

router.post("/webhooks/stripe", async (req, res) => {
  const container = req.scope
  const logger = container.resolve("logger")
  const paymentModuleService = container.resolve(Modules.PAYMENT)

  logger.info("Received Stripe webhook")

  const signature = req.headers["stripe-signature"]

  if (!signature) {
    logger.error("No Stripe signature found")
    return res.status(400).json({ message: "No signature found" })
  }

  try {
    // Let the payment module handle the webhook
    await paymentModuleService.processWebhook("stripe", {
      signature,
      body: req.body,
    })

    return res.status(200).json({ message: "Webhook processed" })
  } catch (error) {
    logger.error("Error processing Stripe webhook:", error)
    return res.status(400).json({ message: "Failed to process webhook" })
  }
})

export default router