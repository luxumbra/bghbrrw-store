import { Modules } from "@medusajs/framework/utils";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function resetPasswordTokenHandler({
  event: {
    data: { entity_id: email, token, actor_type },
  },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION);

  // Customise these URLs for your frontend/admin
  const urlPrefix =
    actor_type === "customer"
      ? "http://localhost:8000"
      : "http://localhost:9000/app";

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    template: "reset-password", // This should match your Resend template key
    data: {
      url: `${urlPrefix}/reset-password?token=${token}&email=${email}`,
    },
  });
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
