import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function checkVariants({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Checking existing variants...");
  
  try {
    const allVariants = await productModuleService.listProductVariants();
    logger.info(`Found ${allVariants.length} existing variants`);
    
    allVariants.forEach(variant => {
      logger.info(`Variant: ${variant.title} - SKU: ${variant.sku} - Product ID: ${variant.product_id}`);
    });
  } catch (error) {
    logger.error("Error listing variants:", error);
  }
}