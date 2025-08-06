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

  console.log('=== PASSWORD RESET DEBUG ===')
  console.log('Raw env var MEDUSA_BACKEND_URL:', process.env.MEDUSA_BACKEND_URL)
  console.log('Raw env var NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
  console.log('actor_type:', actor_type)

  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const MEDUSA_FRONTEND_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

  console.log('Final MEDUSA_BACKEND_URL:', MEDUSA_BACKEND_URL)
  console.log('Final MEDUSA_FRONTEND_URL:', MEDUSA_FRONTEND_URL)

  const urlPrefix = actor_type === "customer"
    ? MEDUSA_FRONTEND_URL
    : `${MEDUSA_BACKEND_URL}/app`;

  console.log('Final URL being sent:', `${urlPrefix}/reset-password?token=${token}&email=${email}`)
  console.log('==============================')

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
