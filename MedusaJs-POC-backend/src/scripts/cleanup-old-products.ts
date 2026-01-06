import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function deleteOldCharger({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const productModule = container.resolve(Modules.PRODUCT)

    logger.info("🗑️  Deleting old USB-C Charger product...")

    try {
        const [charger] = await productModule.listProducts({ handle: "usb-c-charger" })

        if (charger) {
            await productModule.deleteProducts([charger.id])
            logger.info(`✅ Deleted product: ${charger.id}`)
        } else {
            logger.info("ℹ️  Product not found")
        }

        // Also delete data booster 1gb if it exists (might have same issue)
        const [booster] = await productModule.listProducts({ handle: "data-booster-1gb" })

        if (booster) {
            await productModule.deleteProducts([booster.id])
            logger.info(`✅ Deleted product: ${booster.id}`)
        }

        logger.info("✅ Cleanup complete! Now run: npx medusa exec ./src/scripts/seed-telecom-catalog.ts")

    } catch (error) {
        logger.error("❌ Error:", error)
        throw error
    }
}
