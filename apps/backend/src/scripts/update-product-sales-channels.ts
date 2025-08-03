import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function updateProductSalesChannels({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  logger.info("Updating product sales channels...");

  const bbWebsiteSalesChannelId = "sc_01JZEPEZ94HMT7R7FSNV6DYTMK";
  
  // Verify the sales channel exists
  const bbWebsiteSalesChannel = await salesChannelModuleService.listSalesChannels({
    id: bbWebsiteSalesChannelId,
  });

  if (!bbWebsiteSalesChannel.length) {
    logger.error(`BB Website sales channel with ID ${bbWebsiteSalesChannelId} not found.`);
    return;
  }

  logger.info(`Found BB Website sales channel: ${bbWebsiteSalesChannel[0].name}`);

  // Get all products
  const allProducts = await productModuleService.listProducts();
  logger.info(`Found ${allProducts.length} products to update`);

  for (const product of allProducts) {
    try {
      // Remove existing sales channel associations
      const existingLinks = await link.list({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [Modules.SALES_CHANNEL]: {},
      });

      if (existingLinks.length > 0) {
        // @ts-ignore - Link type property access
        await link.dismiss(existingLinks.map(link => link.id));
        logger.info(`Removed ${existingLinks.length} existing sales channel links for product: ${product.title}`);
      }

      // Add the BB Website sales channel
      await link.create({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [Modules.SALES_CHANNEL]: {
          sales_channel_id: bbWebsiteSalesChannelId,
        },
      });

      logger.info(`Updated sales channel for product: ${product.title}`);
    } catch (error) {
      logger.error(`Error updating sales channel for product ${product.title}:`, error);
    }
  }

  logger.info("Finished updating product sales channels");
}