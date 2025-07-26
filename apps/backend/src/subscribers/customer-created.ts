import { Modules } from "@medusajs/framework/utils";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import Stripe from "stripe";

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  const customerService = container.resolve(Modules.CUSTOMER);
  const paymentModuleService = container.resolve(Modules.PAYMENT);

  try {
    // Get the customer details
    const customer = await customerService.retrieveCustomer(data.id);

    if (!customer) {
      logger.error(`Customer ${data.id} not found`);
      return;
    }

    // Create a Stripe customer if one doesn't exist
    if (!customer.metadata?.stripe_id) {
      logger.info(`Creating Stripe customer for ${customer.email}`);

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2023-10-16",
      });

      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || undefined,
        metadata: {
          medusa_customer_id: customer.id
        }
      });

      // Update the customer with the Stripe ID
      await customerService.update(customer.id, {
        metadata: {
          ...customer.metadata,
          stripe_id: stripeCustomer.id
        }
      });

      // Also update the payment provider data
      await paymentModuleService.updatePaymentProvider("stripe", {
        customer_id: customer.id,
        data: {
          customer_id: stripeCustomer.id
        }
      });

      logger.info(`Created Stripe customer ${stripeCustomer.id} for ${customer.email}`);
    }
  } catch (error) {
    logger.error("Error in customer created handler:", error);
    logger.error(error);
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
};