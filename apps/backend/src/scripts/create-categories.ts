import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

export default async function createCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Creating Etsy shop section categories...");

  // Categories mapped to Etsy shop sections
  const categories = [
    "Wall Decor",      // Etsy section_id 51430769
    "Lighting",       // Etsy section_id 53754699 (Tealight holders)
    "Keepsakes"       // Etsy section_id 53779276
  ];

  const existingCategories = await productModuleService.listProductCategories();
  logger.info(`Found ${existingCategories.length} existing categories`);

  // Filter out categories that already exist
  const categoriesToCreate = categories.filter(name => 
    !existingCategories.some(existing => existing.name === name)
  );

  if (categoriesToCreate.length === 0) {
    logger.info("All categories already exist");
    return;
  }

  logger.info(`Creating ${categoriesToCreate.length} new categories: ${categoriesToCreate.join(", ")}`);

  const { result: newCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: categoriesToCreate.map(name => ({
        name,
        is_active: true,
      })),
    },
  });

  logger.info(`Successfully created ${newCategories.length} categories`);
  newCategories.forEach(category => {
    logger.info(`  - ${category.name} (ID: ${category.id})`);
  });
}