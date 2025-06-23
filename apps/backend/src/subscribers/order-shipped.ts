import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderShippedWorkflow } from "../workflows/send-order-shipment";

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendOrderShippedWorkflow(container).run({
    input: {
      id: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: "shipment.created",
};
