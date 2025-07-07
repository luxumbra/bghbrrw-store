import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function checkProductCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Checking product category assignments...");
  
  const allProducts = await productModuleService.listProducts({}, { relations: ["categories"] });
  const allCategories = await productModuleService.listProductCategories();
  
  logger.info(`Found ${allProducts.length} products and ${allCategories.length} categories`);
  
  // Group products by category
  const productsByCategory = {};
  
  allProducts.forEach(product => {
    const categoryName = product.categories?.[0]?.name || "No category";
    if (!productsByCategory[categoryName]) {
      productsByCategory[categoryName] = [];
    }
    productsByCategory[categoryName].push(product.title);
  });
  
  // Display results
  Object.keys(productsByCategory).forEach(categoryName => {
    logger.info(`\n=== ${categoryName} ===`);
    productsByCategory[categoryName].forEach(title => {
      logger.info(`  - ${title}`);
    });
  });
}