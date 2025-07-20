import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function checkSalesChannels({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  logger.info("Checking available sales channels...");

  try {
    const channels = await salesChannelModuleService.listSalesChannels();

    logger.info(`Found ${channels.length} sales channels:`);
    channels.forEach(channel => {
      logger.info(`- ID: ${channel.id}, Name: ${channel.name}`);
    });
  } catch (error) {
    logger.error("Error fetching sales channels:", error);
  }
}