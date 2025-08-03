import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  updateProductsWorkflow,
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

export default async function seedEtsyProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  logger.info("Starting Etsy product seeding...");

  // Get the BB Website sales channel
  const bbWebsiteSalesChannelId = process.env.MEDUSA_SALES_CHANNEL_ID;
  const bbWebsiteSalesChannel = await salesChannelModuleService.listSalesChannels({
    id: bbWebsiteSalesChannelId,
  });

  if (!bbWebsiteSalesChannel.length) {
    logger.error(`BB Website sales channel with ID ${bbWebsiteSalesChannelId} not found.`);
    return;
  }

  // Get the default shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  if (!shippingProfiles.length) {
    logger.error("Default shipping profile not found. Please run the main seed script first.");
    return;
  }

  const shippingProfile = shippingProfiles[0];

  // Get stock location
  const stockLocations = await stockLocationModuleService.listStockLocations({});
  const stockLocation = stockLocations[0];

  if (!stockLocation) {
    logger.error("No stock location found. Please run the main seed script first.");
    return;
  }

  // Read and parse the CSV file
  const csvPath = "/workspace/etsy/EtsyListingsDownload.csv";

  if (!fs.existsSync(csvPath)) {
    logger.error(`CSV file not found at ${csvPath}`);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records: EtsyProduct[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  logger.info(`Found ${records.length} products in CSV file`);

  // Create categories based on unique tags
  const allTags = new Set<string>();
  records.forEach(product => {
    if (product.TAGS) {
      product.TAGS.split(',').forEach(tag => {
        allTags.add(tag.trim());
      });
    }
  });

  // Create categories mapped to Etsy shop sections
  const mainCategories = [
    "Wall Decor",      // Etsy section_id 51430769
    "Lighting",       // Etsy section_id 53754699 (Tealight holders)
    "Keepsakes"       // Etsy section_id 53779276
  ];

  logger.info("Getting existing categories...");
  const productModuleService = container.resolve(Modules.PRODUCT);
  const categoryResult = await productModuleService.listProductCategories();

  logger.info(`Available categories: ${categoryResult.map(cat => cat.name).join(", ")}`);

  // Check for existing products with matching SKUs
  logger.info("Checking for existing products with matching SKUs...");
  const allExistingProducts = await productModuleService.listProducts({}, { relations: ["variants"] });
  const existingProductsBySku = new Map<string, any>();

  // Map existing products by their SKUs
  allExistingProducts.forEach(product => {
    if (product.variants) {
      product.variants.forEach((variant: any) => {
        if (variant.sku) {
          existingProductsBySku.set(variant.sku, product);
        }
      });
    }
  });

  // Convert Etsy products to Medusa format
  const medusaProducts = records.map((etsyProduct, index) => {
    logger.info(`Processing product ${index}: ${etsyProduct.TITLE} (SKU: ${etsyProduct.SKU || 'none'})`);
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

    // Determine category based on product title/type (mapping to Etsy shop sections)
    // For now, skip category assignment since categories are broken
    let categoryId = null;

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
        logger.info(`Creating variant: ${variantSku}`);
        variants.push({
          title: `${etsyProduct.TITLE} - ${value}`,
          sku: variantSku,
          options: {
            [etsyProduct["VARIATION 1 TYPE"]]: value,
          },
          prices: [
            {
              amount: priceAmount,
              currency_code: etsyProduct.CURRENCY_CODE.toLowerCase(),
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
      logger.info(`Creating default variant: ${variantSku}`);
      variants.push({
        title: etsyProduct.TITLE,
        sku: variantSku,
        options: {
          "Default": "Default",
        },
        prices: [
          {
            amount: priceAmount,
            currency_code: etsyProduct.CURRENCY_CODE.toLowerCase(),
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
                currency_code: etsyProduct.CURRENCY_CODE.toLowerCase(),
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
      category_ids: [],
      description: etsyProduct.DESCRIPTION,
      handle: handle,
      weight: 400, // Default weight
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images,
      options,
      variants,
      // tags: etsyProduct.TAGS ? etsyProduct.TAGS.split(",").map(tag => ({ value: tag.trim() })) : [],
      material: etsyProduct.MATERIALS || null,
      sales_channels: [
        {
          id: bbWebsiteSalesChannelId,
        },
      ],
    };
  });

  // Separate new products from updates
  const newProducts: any[] = [];
  const productUpdates: any[] = [];

  // Also map existing products by handle for products without SKUs
  const existingProductsByHandle = new Map<string, any>();
  allExistingProducts.forEach(product => {
    existingProductsByHandle.set(product.handle, product);
  });

  medusaProducts.forEach(productData => {
    // Check if any variant SKU exists OR if handle exists (for products without SKUs)
    const hasExistingProductBySku = productData.variants.some(variant =>
      existingProductsBySku.has(variant.sku)
    );

    const hasExistingProductByHandle = existingProductsByHandle.has(productData.handle);

    if (hasExistingProductBySku || hasExistingProductByHandle) {
      // Find the existing product to update
      let existingProduct: any = null;

      if (hasExistingProductBySku) {
        const firstVariantSku = productData.variants[0]?.sku;
        existingProduct = existingProductsBySku.get(firstVariantSku);
      } else if (hasExistingProductByHandle) {
        existingProduct = existingProductsByHandle.get(productData.handle);
      }

      if (existingProduct) {
        productUpdates.push({
          id: existingProduct.id,
          title: productData.title,
          description: productData.description,
          material: productData.material,
          // Note: We'll update variants separately if needed
        });
      }
    } else {
      newProducts.push(productData);
    }
  });

  if (newProducts.length > 0) {
    logger.info(`Creating ${newProducts.length} new products...`);
    await createProductsWorkflow(container).run({
      input: {
        products: newProducts,
      },
    });
  }

  if (productUpdates.length > 0) {
    logger.info(`Updating ${productUpdates.length} existing products...`);
    for (const update of productUpdates) {
      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: update.id },
          update: {
            title: update.title,
            description: update.description,
            material: update.material,
          },
        },
      });
    }
  }

  logger.info("Setting up inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];

  // Set inventory levels based on CSV quantity
  records.forEach(etsyProduct => {
    const quantity = parseInt(etsyProduct.QUANTITY) || 1;

    // Find matching inventory items for this product
    const matchingItems = inventoryItems.filter(item =>
      item.sku && item.sku.includes(etsyProduct.TITLE.toLowerCase().replace(/[^a-z0-9]/g, ""))
    );

    matchingItems.forEach(item => {
      inventoryLevels.push({
        location_id: stockLocation.id,
        stocked_quantity: quantity,
        inventory_item_id: item.id,
      });
    });
  });

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
  }

  logger.info(`Successfully seeded ${records.length} Etsy products!`);
}