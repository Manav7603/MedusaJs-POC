
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function configureRegions({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const regionService = container.resolve(Modules.REGION)

    logger.info("Starting Region Configuration: Restricting to India and France...")

    const regions = await regionService.listRegions({})

    for (const region of regions) {
        const name = region.name.toLowerCase()

        // Check if it's India or France
        if (name === "india" || name === "france") {
            logger.info(`Keeping region: ${region.name} (${region.currency_code})`)
            continue
        }

        // Attempt to delete others (EU, NA, etc.)
        logger.info(`Deleting unwanted region: ${region.name} (ID: ${region.id})`)
        try {
            await regionService.deleteRegions([region.id])
            logger.info(`Deleted ${region.name}`)
        } catch (e) {
            logger.error(`Failed to delete ${region.name}: ${e.message}`)
        }
    }

    // Ensure France exists
    const updatedRegions = await regionService.listRegions({})
    const franceExists = updatedRegions.find(r => r.name.toLowerCase() === "france")

    if (!franceExists) {
        logger.info("France region missing. Creating 'France' (EUR)...")
        try {
            await regionService.createRegions({
                name: "France",
                currency_code: "eur",
                countries: ["fr"],
            })
            logger.info("Created France region.")
        } catch (e) {
            logger.error(`Failed to create France: ${e.message}`)
        }
    }

    const finalRegions = await regionService.listRegions({})
    logger.info(`Final Regions: ${finalRegions.map(r => r.name).join(", ")}`)
}
