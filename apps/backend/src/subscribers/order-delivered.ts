import { Modules } from "@medusajs/framework/utils";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderShippedWorkflow } from "../workflows/send-order-shipped-confirmation";

export default async function orderDeliveredHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("🚚 Fulfillment created event triggered with ID:", data.id);

  // Run the workflow to get the fulfillment and order data
  const { result } = await sendOrderShippedWorkflow(container).run({
    input: {
      id: data.id,
    },
  });

  const fulfillment = result.fulfillment;
  const order = result.order;

  if (fulfillment && order) {
    try {
      // Send customer email
      const notificationModuleService = container.resolve(Modules.NOTIFICATION);
      await notificationModuleService.createNotifications({
        to: order.email || "issues@boughandburrow.uk",
        template: "order-delivered",
        channel: "email",
        data: { order, fulfillment },
      });

      // Send admin notification email
      await notificationModuleService.createNotifications({
        to: "notify@updates.boughandburrow.uk",
        template: "admin-order-delivered",
        channel: "email",
        data: {
          order,
          fulfillment,
          isAdminNotification: true,
          message: `Order #${String(
            (order as any).display_id
          )} has been delivered.`,
        },
      });

      console.log("✅ Customer and admin emails sent successfully");
    } catch (error) {
      console.error("❌ Error sending emails:", error);
    }
  } else {
    console.error("❌ Missing fulfillment or order data");
  }
}

export const config: SubscriberConfig = {
  event: "delivery.created",
};
