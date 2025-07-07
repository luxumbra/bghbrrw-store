import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { 
  createProductCategoriesWorkflow,
  deleteProductCategoriesWorkflow 
} from "@medusajs/medusa/core-flows";

export default async function fixCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Fixing broken categories...");
  
  // Get all existing categories
  const existingCategories = await productModuleService.listProductCategories();
  
  // Delete broken categories (those with undefined names)
  const brokenCategories = existingCategories.filter(cat => !cat.name || cat.name === "undefined");
  
  if (brokenCategories.length > 0) {
    logger.info(`Deleting ${brokenCategories.length} broken categories...`);
    for (const category of brokenCategories) {
      try {
        await deleteProductCategoriesWorkflow(container).run({
          input: { ids: [category.id] },
        });
        logger.info(`  Deleted category ${category.id}`);
      } catch (error) {
        logger.warn(`  Failed to delete category ${category.id}: ${error.message}`);
        // Try direct deletion via module service
        try {
          await productModuleService.deleteProductCategories([category.id]);
          logger.info(`  Deleted category ${category.id} via module service`);
        } catch (moduleError) {
          logger.warn(`  Failed to delete via module service: ${moduleError.message}`);
        }
      }
    }
  }

  // Create the correct categories
  const categories = [
    "Wall Decor",      // Etsy section_id 51430769
    "Lighting",       // Etsy section_id 53754699 (Tealight holders)
    "Keepsakes"       // Etsy section_id 53779276
  ];

  logger.info(`Creating ${categories.length} new categories...`);
  const { result: newCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: categories.map(name => ({
        name,
        is_active: true,
      })),
    },
  });

  logger.info(`Successfully created categories:`);
  newCategories.forEach(category => {
    logger.info(`  - ${category.name} (ID: ${category.id})`);
  });
}