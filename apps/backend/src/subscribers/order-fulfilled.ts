import { Modules } from "@medusajs/framework/utils";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderFulfilledWorkflow } from "../workflows/send-order-fulfilled-confirmation";

export default async function orderFulfilledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ order_id: string; fulfillment_id: string; no_notification: boolean }>) {
  console.log("📦 Order fulfillment created event triggered");
  console.log("📦 Order ID:", data.order_id);
  console.log("📦 Fulfillment ID:", data.fulfillment_id);
  console.log("📦 No notification:", data.no_notification);

  // Skip if no_notification is true
  if (data.no_notification) {
    console.log("⏭️ Skipping notification as no_notification is true");
    return;
  }

  try {
    // Run the workflow to get the fulfillment and order data
    const { result } = await sendOrderFulfilledWorkflow(container).run({
      input: {
        fulfillment_id: data.fulfillment_id,
        order_id: data.order_id,
      },
    });

    const fulfillment = result.fulfillment;
    const order = result.order;

    if (fulfillment && order) {
      // Send customer email
      const notificationModuleService = container.resolve(Modules.NOTIFICATION);
      await notificationModuleService.createNotifications({
        to: order.email || "issues@boughandburrow.uk",
        template: "order-fulfilled",
        channel: "email",
        data: { order, fulfillment },
      });

      // Send admin notification email
      await notificationModuleService.createNotifications({
        to: "notify@updates.boughandburrow.uk",
        template: "admin-order-fulfilled",
        channel: "email",
        data: {
          order,
          fulfillment,
          isAdminNotification: true,
          message: `Order #${String(
            (order as any).display_id
          )} has been fulfilled for ${order.email}`,
        },
      });

      console.log("✅ Customer and admin fulfillment emails sent successfully");
    } else {
      console.error("❌ Missing fulfillment or order data");
    }
  } catch (error) {
    console.error("❌ Error sending fulfillment emails:", error);
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
};