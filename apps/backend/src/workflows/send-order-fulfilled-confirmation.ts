import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";

export const sendOrderFulfilledWorkflow = createWorkflow(
  "send-order-fulfilled-confirmation",
  ({ fulfillment_id, order_id }: { fulfillment_id: string; order_id: string }) => {
    // @ts-ignore
    const { data: fulfillments } = useQueryGraphStep({
      entity: "fulfillment",
      fields: [
        "id",
        "tracking_numbers",
        "tracking_links",
        "labels.*",
        "delivery_address.*",
        "order.id",
        "order.display_id",
        "order.email",
        "order.customer.*",
        "order.shipping_address.*",
        "order.billing_address.*",
        "order.items.*",
        "order.total",
        "order.subtotal",
        "order.shipping_total",
        "order.tax_total",
        "order.currency_code",
      ],
      filters: {
        id: fulfillment_id,
      },
    });

    const fulfillment = fulfillments[0];
    const order = fulfillment.order;

    console.log("📦 Fulfillment data:", JSON.stringify(fulfillment, null, 2));
    console.log("📦 Order data:", JSON.stringify(order, null, 2));

    // Return the data instead of sending notification
    return new WorkflowResponse({
      fulfillment,
      order,
    });
  }
);