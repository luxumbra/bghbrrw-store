import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

interface EtsyProduct {
  TITLE: string;
  DESCRIPTION: string;
  PRICE: string;
  CURRENCY_CODE: string;
  QUANTITY: string;
  TAGS: string;
  MATERIALS: string;
  IMAGE1: string;
  IMAGE2: string;
  IMAGE3: string;
  IMAGE4: string;
  IMAGE5: string;
  IMAGE6: string;
  IMAGE7: string;
  IMAGE8: string;
  IMAGE9: string;
  IMAGE10: string;
  "VARIATION 1 TYPE": string;
  "VARIATION 1 NAME": string;
  "VARIATION 1 VALUES": string;
  "VARIATION 2 TYPE": string;
  "VARIATION 2 NAME": string;
  "VARIATION 2 VALUES": string;
  SKU: string;
}

export default async function seedBoughAndBurrow({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const userModuleService = container.resolve(Modules.USER);

  logger.info("🌿 Starting Bough & Burrow store setup on clean database...");

  // Step 0: Create admin user
  logger.info("Creating admin user...");

  let adminUser;
  try {
    // Use the medusa CLI command approach for user creation
    const { execSync } = require('child_process');
    execSync('npx medusa user --email hello@bghbrrw.uk --password theburrow', {
      cwd: '/workspace/apps/backend',
      stdio: 'pipe'
    });
    logger.info("Admin user created successfully");

    // Get the created user
    const users = await userModuleService.listUsers({
      email: "hello@bghbrrw.uk",
    });
    adminUser = users[0];
  } catch (error) {
    logger.info("Admin user already exists, using existing user");
    const users = await userModuleService.listUsers({
      email: "hello@bghbrrw.uk",
    });
    adminUser = users[0];
  }

  // Step 1: Set up store information
  logger.info("Setting up store information...");
  const [store] = await storeModuleService.listStores();

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Bough & Burrow",
        supported_currencies: [
          {
            currency_code: "gbp",
            is_default: true,
          },
        ],
      },
    },
  });

  // Step 2: Create sales channels
  logger.info("Creating sales channels...");
  const { result: salesChannelResult } = await createSalesChannelsWorkflow(
    container
  ).run({
    input: {
      salesChannelsData: [
        {
          name: "Bough & Burrow Website",
          description: "Main website for Bough & Burrow wooden crafts",
        },
      ],
    },
  });
  const websiteSalesChannel = salesChannelResult[0];

  // Step 3: Set up regions
  logger.info("Setting up regions...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United Kingdom",
          currency_code: "gbp",
          countries: ["gb"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const ukRegion = regionResult[0];

  // Step 4: Set up tax regions
  logger.info("Setting up tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "gb",
        provider_id: "tp_system",
      },
    ],
  });

  // Step 5: Create stock location
  logger.info("Creating stock location...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "The Burrow",
          address: {
            city: "Wotton-under-Edge",
            country_code: "gb",
            address_1: "The Burrow",
            postal_code: "GL12 7AA",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  // Step 6: Create shipping profiles
  logger.info("Creating shipping profiles...");
  const { result: shippingProfileResult } = await createShippingProfilesWorkflow(
    container
  ).run({
    input: {
      data: [
        {
          name: "Standard UK Shipping",
          type: "default",
        },
        {
          name: "Express Shipping",
          type: "custom",
        },
      ],
    },
  });
  const standardShippingProfile = shippingProfileResult[0];
  const expressShippingProfile = shippingProfileResult[1];

  // Step 7: Create fulfillment sets and shipping options
  logger.info("Setting up shipping options...");
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "UK Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "United Kingdom",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // Link the manual fulfillment provider to the stock location
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  // Create shipping options
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard UK Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: standardShippingProfile.id,
        type: {
          label: "Standard",
          description: "Tracked 48 - Delivery in 3-5 working days",
          code: "standard",
        },
        prices: [
          {
            currency_code: "gbp",
            amount: 0, // Free
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express UK Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: standardShippingProfile.id,
        type: {
          label: "Express",
          description: "Tracked 24 - 1 to 2 Days delivery",
          code: "express",
        },
        prices: [
          {
            currency_code: "gbp",
            amount: 495 / 100, // £5.00
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });

  // Step 8: Link sales channels to stock location and API keys
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [websiteSalesChannel.id],
    },
  });

  // Step 9: Create publishable API key
  logger.info("Creating publishable API key...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Bough & Burrow Website",
          type: "publishable",
          created_by: adminUser.id,
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [websiteSalesChannel.id],
    },
  });

  // Step 10: Create product categories
  logger.info("Creating product categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Wall Art & Decor",
          handle: "wall-art-decor",
          is_active: true,
          description: "Handcrafted wooden wall art and decorative pieces",
        },
        {
          name: "Tealight Holders",
          handle: "tealight-holders",
          is_active: true,
          description: "Rustic tealight holders and candle stands",
        },
        {
          name: "Keepsakes & Ornaments",
          handle: "keepsakes-ornaments",
          is_active: true,
          description: "Personalised wooden keepsakes and ornaments",
        },
        {
          name: "Lighting",
          handle: "lighting",
          is_active: true,
          description: "Rustic lighting pieces",
        },
      ],
    },
  });

  // Step 11: Import Etsy products
  logger.info("Importing Etsy products...");

  // Read and parse the CSV file
  const csvPath = "/workspace/etsy/EtsyListingsDownload.csv";

  if (!fs.existsSync(csvPath)) {
    logger.error(`CSV file not found at ${csvPath}`);
    logger.info("Skipping product import - you can run the Etsy import separately");
  } else {
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records: EtsyProduct[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    logger.info(`Found ${records.length} products in CSV file`);

    // Convert Etsy products to Medusa format
    const medusaProducts = records.map((etsyProduct, index) => {
      logger.info(`Processing product ${index + 1}/${records.length}: ${etsyProduct.TITLE}`);

      // Extract images (filter out empty ones)
      const images = [
        etsyProduct.IMAGE1,
        etsyProduct.IMAGE2,
        etsyProduct.IMAGE3,
        etsyProduct.IMAGE4,
        etsyProduct.IMAGE5,
        etsyProduct.IMAGE6,
        etsyProduct.IMAGE7,
        etsyProduct.IMAGE8,
        etsyProduct.IMAGE9,
        etsyProduct.IMAGE10,
      ]
        .filter(url => url && url.trim() !== "")
        .map(url => ({ url: url.trim() }));

      // Create handle from title
      const handle = etsyProduct.TITLE
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Determine category based on product title/type
      let categoryId: string | null = null;
      const title = etsyProduct.TITLE.toLowerCase();

      if (title.includes("tealight") || title.includes("candle")) {
        categoryId = categoryResult.find(cat => cat.name === "Tealight Holders")?.id || null;
      } else if (title.includes("ornament") || title.includes("keepsake")) {
        categoryId = categoryResult.find(cat => cat.name === "Keepsakes & Ornaments")?.id || null;
      } else if (title.includes("wall art") || title.includes("wall decor")) {
        categoryId = categoryResult.find(cat => cat.name === "Wall Art & Decor")?.id || null;
      } else {
        categoryId = categoryResult.find(cat => cat.name === "Lighting")?.id || null;
      }

      // Parse price as major currency unit (pounds, not pence)
      const priceAmount = parseFloat(etsyProduct.PRICE);

      // Handle variations
      const options: any[] = [];
      const variants: any[] = [];

      if (etsyProduct["VARIATION 1 TYPE"] && etsyProduct["VARIATION 1 VALUES"]) {
        const variation1Values = etsyProduct["VARIATION 1 VALUES"].split(",").map(v => v.trim());
        options.push({
          title: etsyProduct["VARIATION 1 TYPE"],
          values: variation1Values,
        });

        // Create variants for each variation
        variation1Values.forEach((value, variantIndex) => {
          const variantSku = etsyProduct.SKU ? `${etsyProduct.SKU}-${variantIndex}` : `${handle}-${value.toLowerCase().replace(/\s+/g, "-")}-${index}-${variantIndex}`;
          variants.push({
            title: `${etsyProduct.TITLE} - ${value}`,
            sku: variantSku,
            options: {
              [etsyProduct["VARIATION 1 TYPE"]]: value,
            },
            prices: [
              {
                amount: priceAmount,
                currency_code: "gbp",
              },
            ],
          });
        });
      } else {
        // No variations, create a default option and single variant
        options.push({
          title: "Default",
          values: ["Default"],
        });

        const variantSku = etsyProduct.SKU || `${handle}-default-${index}`;
        variants.push({
          title: etsyProduct.TITLE,
          sku: variantSku,
          options: {
            "Default": "Default",
          },
          prices: [
            {
              amount: priceAmount,
              currency_code: "gbp",
            },
          ],
        });
      }

      // Add second variation if exists
      if (etsyProduct["VARIATION 2 TYPE"] && etsyProduct["VARIATION 2 VALUES"]) {
        const variation2Values = etsyProduct["VARIATION 2 VALUES"].split(",").map(v => v.trim());
        options.push({
          title: etsyProduct["VARIATION 2 TYPE"],
          values: variation2Values,
        });

        // Rebuild variants with both variations
        const newVariants: any[] = [];
        const variation1Values = etsyProduct["VARIATION 1 VALUES"].split(",").map(v => v.trim());

        let combinationIndex = 0;
        variation1Values.forEach(value1 => {
          variation2Values.forEach(value2 => {
            const variantSku = etsyProduct.SKU ? `${etsyProduct.SKU}-${combinationIndex}` : `${handle}-${value1.toLowerCase().replace(/\s+/g, "-")}-${value2.toLowerCase().replace(/\s+/g, "-")}-${index}-${combinationIndex}`;
            newVariants.push({
              title: `${etsyProduct.TITLE} - ${value1} / ${value2}`,
              sku: variantSku,
              options: {
                [etsyProduct["VARIATION 1 TYPE"]]: value1,
                [etsyProduct["VARIATION 2 TYPE"]]: value2,
              },
              prices: [
                {
                  amount: priceAmount,
                  currency_code: "gbp",
                },
              ],
            });
            combinationIndex++;
          });
        });

        variants.length = 0; // Clear existing variants
        variants.push(...newVariants);
      }

      return {
        title: etsyProduct.TITLE,
        category_ids: categoryId ? [categoryId] : [],
        description: etsyProduct.DESCRIPTION,
        handle: handle,
        weight: 0, // Default weight
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: standardShippingProfile.id,
        images,
        options,
        variants,
        material: etsyProduct.MATERIALS || undefined,
        sales_channels: [
          {
            id: websiteSalesChannel.id,
          },
        ],
      };
    });

    // Create products
    logger.info(`Creating ${medusaProducts.length} products...`);
    await createProductsWorkflow(container).run({
      input: {
        products: medusaProducts,
      },
    });

    // Set up inventory levels
    logger.info("Setting up inventory levels...");
    const allProducts = await productModuleService.listProducts({}, { relations: ["variants"] });

    const inventoryLevels: CreateInventoryLevelInput[] = [];
    allProducts.forEach(product => {
      if (product.variants) {
        product.variants.forEach(variant => {
          // Check if the variant has an inventory_item_id
          if (variant.inventory_item_id) {
            inventoryLevels.push({
              inventory_item_id: variant.inventory_item_id,
              location_id: stockLocation.id,
              stocked_quantity: 10, // Default stock level
            });
          } else {
            logger.warn(`Variant ${variant.id} has no inventory_item_id, skipping inventory level creation`);
          }
        });
      }
    });

    if (inventoryLevels.length > 0) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryLevels,
        },
      });
      logger.info(`Created ${inventoryLevels.length} inventory levels`);
    } else {
      logger.warn("No inventory levels to create - variants may not have inventory items");
    }

    logger.info(`Successfully imported ${records.length} products from Etsy!`);
  }

  logger.info("🌿 Bough & Burrow store setup complete!");
  logger.info("Store URL: http://localhost:8000");
  logger.info("Admin URL: http://localhost:9000/app");
  logger.info(`Publishable API Key: ${publishableApiKey.id}`);
}
