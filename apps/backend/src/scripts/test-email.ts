import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function testEmail({ container }: ExecArgs) {
  console.log("🧪 Testing email functionality...");

  try {
    // Test notification service
    const notificationModuleService = container.resolve(Modules.NOTIFICATION);
    console.log("✅ Notification service resolved");

    // Test sending a simple notification
    const result = await notificationModuleService.createNotifications({
      to: "test@example.com",
      template: "order-placed",
      channel: "email",
      data: {
        order: {
          id: "test-order",
          display_id: "TEST-001",
          email: "test@example.com",
          total: 1000,
          currency_code: "gbp",
        },
      },
    });

    console.log("✅ Test notification created:", result);
    console.log("📧 Email functionality appears to be working");

  } catch (error) {
    console.error("❌ Email test failed:", error);
  }
}