
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listRegionsDetailed({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const regionService = container.resolve(Modules.REGION)

    const regions = await regionService.listRegions({}, {
        relations: ["countries"]
    })

    logger.info(`Found ${regions.length} regions:`)
    for (const region of regions) {
        logger.info(`- Region: ${region.name} (ID: ${region.id}, Currency: ${region.currency_code})`)
        const countryCodes = region.countries?.map(c => c.iso_2).join(", ")
        logger.info(`  Countries: ${countryCodes}`)
    }
}
