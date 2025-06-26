import { NotificationHelperService } from "../services/notification-helper";
import { Modules } from "@medusajs/framework/utils";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderShippedWorkflow } from "../workflows/send-order-shipped-confirmation";

export default async function orderShippedHandler({
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

  console.log("📧 Workflow result:", JSON.stringify(result, null, 2));

  // Get the fulfillment and order data from the workflow result
  const fulfillment = result.fulfillment;
  const order = result.order;

  console.log("📦 Fulfillment data:", fulfillment ? "Found" : "Not found");
  console.log("📋 Order data:", order ? "Found" : "Not found");

  if (fulfillment && order) {
    try {
      // Send email and store notification in one call
      const notificationModuleService = container.resolve(Modules.NOTIFICATION);
      const notification = await notificationModuleService.createNotifications({
        to: order.email || "issues@boughandburrow.uk",
        template: "order-shipped",
        channel: "email",
        data: { order, fulfillment },
      });

      console.log("✅ Email sent and notification stored:", notification);

      // Try using the notification helper service for admin notifications
      const notificationHelper = new NotificationHelperService(container);
      await notificationHelper.sendOrderShippedNotification(order, fulfillment);
    } catch (error) {
      console.error("❌ Error sending email/storing notification:", error);
    }
  } else {
    console.error("❌ Missing fulfillment or order data");
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
};
