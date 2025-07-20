import { ExecArgs } from "@medusajs/framework/types";
import * as fs from "fs";
import { parse } from "csv-parse/sync";

interface EtsyProduct {
  TITLE: string;
  PRICE: string;
  CURRENCY_CODE: string;
}

export default async function checkPrices({ container }: ExecArgs) {
  const logger = container.resolve("logger");

  const csvPath = "/workspace/etsy/EtsyListingsDownload.csv";

  if (!fs.existsSync(csvPath)) {
    logger.error(`CSV file not found at ${csvPath}`);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records: EtsyProduct[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  logger.info(`Found ${records.length} products`);

  // Check first 5 prices
  records.slice(0, 5).forEach((product, index) => {
    const originalPrice = parseFloat(product.PRICE);
    const priceInPence = originalPrice * 100;

    logger.info(`Product ${index + 1}: "${product.TITLE}"`);
    logger.info(`  Original price: ${product.PRICE} ${product.CURRENCY_CODE}`);
    logger.info(`  Price in pence: ${priceInPence}`);
    logger.info(`  Price in pounds: £${(priceInPence / 100).toFixed(2)}`);
    logger.info("---");
  });
}