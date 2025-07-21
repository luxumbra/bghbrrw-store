import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function testFulfillmentEmail({ container }: ExecArgs) {
  console.log("🧪 Testing fulfillment email functionality...");

  try {
    // Test notification service directly
    const notificationModuleService = container.resolve(Modules.NOTIFICATION);

    // Test customer fulfillment email
    const customerNotification = await notificationModuleService.createNotifications({
      to: "test@example.com",
      template: "order-fulfilled",
      channel: "email",
      data: {
        order: {
          id: "order_test_123",
          display_id: "TEST-001",
          email: "test@example.com",
          total: 2500,
          currency_code: "gbp",
          customer: {
            first_name: "Test",
            last_name: "Customer",
          },
          shipping_address: {
            first_name: "Test",
            last_name: "Customer",
            address_1: "123 Test Street",
            city: "Test City",
            postal_code: "TE1 1ST",
            country_code: "gb",
          },
          billing_address: {
            first_name: "Test",
            last_name: "Customer",
            address_1: "123 Test Street",
            city: "Test City",
            postal_code: "TE1 1ST",
            country_code: "gb",
          },
        },
        fulfillment: {
          id: "fulfillment_test_123",
          order_id: "order_test_123",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      },
    });

    console.log("✅ Customer fulfillment notification created:", customerNotification);

    // Test admin fulfillment email
    const adminNotification = await notificationModuleService.createNotifications({
      to: "admin@example.com",
      template: "admin-order-fulfilled",
      channel: "email",
      data: {
        order: {
          id: "order_test_123",
          display_id: "TEST-001",
          email: "test@example.com",
          total: 2500,
          currency_code: "gbp",
          customer: {
            first_name: "Test",
            last_name: "Customer",
          },
          shipping_address: {
            first_name: "Test",
            last_name: "Customer",
            address_1: "123 Test Street",
            city: "Test City",
            postal_code: "TE1 1ST",
            country_code: "gb",
          },
        },
        fulfillment: {
          id: "fulfillment_test_123",
          order_id: "order_test_123",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        isAdminNotification: true,
        message: "Order has been fulfilled",
      },
    });

    console.log("✅ Admin fulfillment notification created:", adminNotification);
    console.log("📧 Fulfillment email functionality appears to be working");

  } catch (error) {
    console.error("❌ Fulfillment email test failed:", error);
  }
}