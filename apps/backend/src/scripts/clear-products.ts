import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function clearProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Clearing all products...");
  
  const allExistingProducts = await productModuleService.listProducts();
  
  if (allExistingProducts.length === 0) {
    logger.info("No products to clear");
    return;
  }
  
  logger.info(`Found ${allExistingProducts.length} products to delete`);
  
  const productIds = allExistingProducts.map(product => product.id);
  
  await deleteProductsWorkflow(container).run({
    input: { ids: productIds },
  });
  
  logger.info("All products cleared successfully");
}