
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listSalesChannels({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

    const channels = await salesChannelService.listSalesChannels({})

    logger.info("--- SALES CHANNELS ---")
    for (const sc of channels) {
        logger.info(`Name: ${sc.name} | ID: ${sc.id}`)
    }
    logger.info("----------------------")
}
