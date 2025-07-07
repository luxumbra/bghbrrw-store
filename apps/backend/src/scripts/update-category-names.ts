import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function updateCategoryNames({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Updating category names...");
  
  const categories = await productModuleService.listProductCategories();
  const categoryNames = ["Wall Decor", "Lighting", "Keepsakes"];
  
  logger.info(`Found ${categories.length} categories to update`);
  
  for (let i = 0; i < Math.min(categories.length, categoryNames.length); i++) {
    const category = categories[i];
    const newName = categoryNames[i];
    
    logger.info(`Updating category ${category.id} to "${newName}"`);
    
    await productModuleService.updateProductCategories([{
      id: category.id,
      name: newName,
      is_active: true,
    }]);
  }
  
  logger.info("Category names updated successfully");
}