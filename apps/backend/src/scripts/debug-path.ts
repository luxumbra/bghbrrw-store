import { ExecArgs } from "@medusajs/framework/types";
import * as path from "path";
import * as fs from "fs";

export default async function debugPath({ container }: ExecArgs) {
  const logger = container.resolve("logger");

  logger.info(`process.cwd(): ${process.cwd()}`);
  logger.info(`__dirname: ${__dirname}`);

  const csvPath = path.join(process.cwd(), "../../etsy/EtsyListingsDownload.csv");
  logger.info(`Resolved path: ${csvPath}`);
  logger.info(`File exists: ${fs.existsSync(csvPath)}`);

  // Try absolute path
  const absolutePath = "/workspace/etsy/EtsyListingsDownload.csv";
  logger.info(`Absolute path: ${absolutePath}`);
  logger.info(`Absolute path exists: ${fs.existsSync(absolutePath)}`);
}