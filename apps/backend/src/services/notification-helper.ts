import { Modules } from "@medusajs/framework/utils";

export class NotificationHelperService {
  container: any;
  notificationModuleService: any;

  constructor(container: any) {
    this.container = container;
    this.notificationModuleService = container.resolve(Modules.NOTIFICATION);
  }

  async sendOrderShippedNotification(order: any, fulfillment: any) {
    console.log("🔔 Creating notification for admin dashboard...");
    console.log("📧 Email:", order.email);
    console.log("📦 Order ID:", order.id);
    console.log("🚚 Fulfillment ID:", fulfillment.id);

    // Try creating an admin notification
    const notificationData = {
      to: "admin@boughandburrow.uk", // Admin email
      template: "order-shipped",
      channel: "admin", // Try admin channel
      data: {
        order,
        fulfillment,
        message: `Order #${order.display_id} has been shipped`,
        event_type: "shipment.created",
      },
    };

    console.log(
      "📋 Admin notification data:",
      JSON.stringify(notificationData, null, 2)
    );

    const result = await this.notificationModuleService.createNotifications(
      notificationData
    );
    console.log("✅ Admin notification created:", result);
    return result;
  }
}
