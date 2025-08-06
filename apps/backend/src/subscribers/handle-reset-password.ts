import { Modules } from "@medusajs/framework/utils";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const MEDUSA_FRONTEND_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

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
      ? MEDUSA_FRONTEND_URL
      : `${MEDUSA_BACKEND_URL}/app`;

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
