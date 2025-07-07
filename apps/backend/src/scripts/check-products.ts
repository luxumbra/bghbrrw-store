import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function checkProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Checking existing products...");
  
  const allExistingProducts = await productModuleService.listProducts({}, { relations: ["variants"] });
  
  logger.info(`Found ${allExistingProducts.length} existing products`);
  
  allExistingProducts.forEach(product => {
    logger.info(`Product: ${product.title} (ID: ${product.id})`);
    if (product.variants) {
      product.variants.forEach(variant => {
        logger.info(`  Variant: ${variant.title} - SKU: ${variant.sku}`);
      });
    }
  });
}