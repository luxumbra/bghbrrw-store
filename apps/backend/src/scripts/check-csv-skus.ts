import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

interface EtsyProduct {
  TITLE: string;
  SKU: string;
}

export default async function checkCsvSkus({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Checking CSV for duplicate SKUs...");
  
  const csvPath = path.join(process.cwd(), "../../etsy/EtsyListingsDownload.csv");
  
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
  
  const skuCounts = new Map();
  const skuProducts = new Map();
  
  records.forEach((product, index) => {
    const sku = product.SKU;
    if (sku) {
      skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
      if (!skuProducts.has(sku)) {
        skuProducts.set(sku, []);
      }
      skuProducts.get(sku).push({ title: product.TITLE, index });
    } else {
      logger.info(`Product at index ${index} has no SKU: ${product.TITLE}`);
    }
  });
  
  logger.info(`Found ${skuCounts.size} unique SKUs`);
  
  // Check for duplicates
  let duplicatesFound = false;
  skuCounts.forEach((count, sku) => {
    if (count > 1) {
      duplicatesFound = true;
      logger.info(`Duplicate SKU "${sku}" found ${count} times:`);
      skuProducts.get(sku).forEach(product => {
        logger.info(`  - ${product.title} (index: ${product.index})`);
      });
    }
  });
  
  if (!duplicatesFound) {
    logger.info("No duplicate SKUs found in CSV");
  }
}