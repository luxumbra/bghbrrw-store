import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";
import { FulfillmentDTO } from "@medusajs/framework/types";

type WorkflowInput = {
  orderId: string;
  fulfillment: FulfillmentDTO; // FulfillmentDTO, received from event/hook
};

export const sendOrderShippedWorkflow = createWorkflow(
  "send-order-shipment",
  ({ orderId, fulfillment }: WorkflowInput) => {
    // @ts-ignore
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
        "customer.*",
        "total",
        "subtotal",
        "discount_total",
        "shipping_total",
        "tax_total",
        "item_subtotal",
        "item_total",
        "item_tax_total",
      ],
      filters: {
        id: orderId,
      },
    });
    const notificationData = transform(
      { order: orders[0], fulfillment },
      ({ order, fulfillment }) => ({
        order,
        fulfillment,
        tracking_number: fulfillment.labels?.[0].tracking_number || "",
      })
    );
    const notification = sendNotificationStep([
      {
        to: orders[0].email,
        channel: "email",
        template: "order-shipped",
        data: notificationData,
      },
    ]);

    return new WorkflowResponse(notification);
  }
);
