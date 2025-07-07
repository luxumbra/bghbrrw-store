import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function listCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Listing all product categories...");
  
  const categories = await productModuleService.listProductCategories();
  
  logger.info(`Found ${categories.length} categories:`);
  categories.forEach(category => {
    logger.info(`  - Name: "${category.name}" | Handle: "${category.handle}" | ID: ${category.id}`);
  });
}