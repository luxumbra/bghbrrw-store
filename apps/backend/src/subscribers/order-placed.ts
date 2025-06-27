import { Modules } from "@medusajs/framework/utils";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderConfirmationWorkflow } from "../workflows/send-order-confirmation";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("🛒 Order placed event triggered with ID:", data.id);

  // Run the workflow to send the customer email
  await sendOrderConfirmationWorkflow(container).run({
    input: {
      id: data.id,
    },
  });

  try {
    // Get order data directly for admin notification
    const orderService = container.resolve(Modules.ORDER);
    const order = await orderService.retrieveOrder(data.id, {
      relations: [
        "shipping_address",
        "billing_address",
        "items",
        "shipping_methods",
      ],
    });

    // Send admin notification email
    const notificationModuleService = container.resolve(Modules.NOTIFICATION);
    await notificationModuleService.createNotifications({
      to: "notify@updates.boughandburrow.uk",
      template: "admin-order-placed",
      channel: "email",
      data: {
        order,
        isAdminNotification: true,
        message: `New order #${order.display_id} received from ${order.email}`,
      },
    });

    console.log("✅ Admin notification email sent for new order");
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
