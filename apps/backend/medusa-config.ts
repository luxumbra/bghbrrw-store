import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());
console.log("NODE_ENV!!!!", process.env.NODE_ENV);

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.NODE_ENV !== "development"
    ? { connection: { ssl: { rejectUnauthorized: false } } }
    : {},
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/notification",

      options: {
        providers: [
          {
            resolve: "./src/modules/resend",

            id: "resend",

            options: {
              channels: ["email"],

              api_key: process.env.RESEND_API_KEY,

              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_SECRET_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },
    // {
    //   resolve: "./src/modules/wishlist",
    //   options: {
    //     jwtSecret: process.env.JWT_SECRET || 'supersecret'
    //   }
    // }
  ],
});
