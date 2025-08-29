import { loadEnv, defineConfig } from "@medusajs/framework/utils";

// Force rebuild for testing deployment pipeline - remove this comment later
loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
    databaseUrl: (() => {
      if (process.env.DATABASE_URL) {
        console.log('Using provided DATABASE_URL');
        return process.env.DATABASE_URL;
      }
      
      const user = process.env.POSTGRES_USER || 'medusa';
      const password = process.env.POSTGRES_PASSWORD || 'defaultpassword';
      const host = process.env.POSTGRES_HOST || 'postgres';
      const db = process.env.POSTGRES_DB || 'boughandburrow';
      
      const url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:5432/${db}?sslmode=disable`;
      console.log('Constructed URL:', `postgresql://${user}:***@${host}:5432/${db}?sslmode=disable`);
      return url;
    })(),
    databaseDriverOptions: {
      connection: {
        ssl: false
      }
    },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    // Admin is always enabled in development
    // For production, use environment variables in your deployment config
    disable: process.env.NODE_ENV === 'production'
      ? process.env.DISABLE_MEDUSA_ADMIN === 'true'
      : false,
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },

    {
      resolve: "@medusajs/medusa/notification",

      options: {
        providers: [
          {
            resolve: process.env.NODE_ENV === 'production'
              ? require('path').resolve(__dirname, '.medusa/server/src/modules/resend')
              : "./src/modules/resend",

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
    {
      resolve: process.env.NODE_ENV === 'production'
        ? require('path').resolve(__dirname, '.medusa/server/src/modules/product-review')
        : "./src/modules/product-review"
    },
    // {
    //   resolve: "./src/modules/wishlist",
    //   options: {
    //     jwtSecret: process.env.JWT_SECRET || 'supersecret'
    //   }
    // }
  ],
});
