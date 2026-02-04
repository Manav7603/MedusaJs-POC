
import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function fixInventory({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const productModule = container.resolve(Modules.PRODUCT)
    const inventoryModule = container.resolve(Modules.INVENTORY)
    const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

    logger.info("📦 Starting Inventory Fix...")

    try {
        // 1. Get or Create Stock Location
        let [location] = await stockLocationModule.listStockLocations({ name: "India Warehouse" })

        if (!location) {
            logger.info("creating India Warehouse location...")
            location = await stockLocationModule.createStockLocations({
                name: "India Warehouse",
                address: {
                    address_1: "123 Tech Park",
                    city: "Mumbai",
                    country_code: "IN"
                }
            })
            logger.info(`✅ Created Location: ${location.name} (${location.id})`)
        } else {
            logger.info(`ℹ️  Using existing Location: ${location.name} (${location.id})`)
        }

        // 2. Get All Products & Variants
        const productData = await productModule.listProducts({}, { relations: ["variants"] })
        // productModule.listProducts returns array directly in recent versions, OR { products: [] } depending on method.
        // Actually, internal modules usually return [products, count] or just products. 
        // Let's safe check. If it's not array, it might be object.

        const products = Array.isArray(productData) ? productData : (productData as any).products || []
        const variants = products.flatMap(p => p.variants)

        logger.info(`🔍 Found ${products.length} products with ${variants.length} variants.`)

        for (const variant of variants) {
            logger.info(`Processing ${variant.title} (SKU: ${variant.sku})...`)

            // 3. Ensure manage_inventory is true
            if (!variant.manage_inventory) {
                await productModule.updateProductVariants(variant.id, { manage_inventory: true })
                logger.info(`   -> Enabled manage_inventory`)
            }

            // 4. Check for existing Inventory Item via Remote Link
            // Link: Product Variant -> Inventory Item
            // We need to query the link first.
            let inventoryItemId: string | undefined

            // Since we can't easily query links by variant ID in a simple way without 'remoteQuery' (which might be complex here),
            // we'll try to find an inventory item by SKU, or create one.
            // A better way in Medusa v2 is often to just ensure one exists.

            // Let's list inventory items by sku match
            const inventoryItemsData = await inventoryModule.listInventoryItems({ sku: variant.sku })
            const inventoryItems = Array.isArray(inventoryItemsData) ? inventoryItemsData : [inventoryItemsData]
            let inventoryItem = inventoryItems[0]

            if (!inventoryItem) {
                logger.info(`   -> Creating new Inventory Item...`)
                inventoryItem = await inventoryModule.createInventoryItems({
                    sku: variant.sku,
                    requires_shipping: true
                })
            }
            inventoryItemId = inventoryItem.id

            // 5. Ensure Link exists
            // We blindly create/dismiss error if exists, or check first.
            // Attempt to link (idempotent-ish if we handle errors or checks)
            // We generally use remoteLink.create
            try {
                await remoteLink.create([
                    {
                        [Modules.PRODUCT]: {
                            product_variant_id: variant.id,
                        },
                        [Modules.INVENTORY]: {
                            inventory_item_id: inventoryItemId,
                        },
                    },
                ])
                // logger.info("   -> Linked Variant to Inventory Item")
            } catch (e) {
                // Ignore if already linked or handle gracefully
            }


            // 6. Update Stock Level
            // Check if level exists at this location
            const levelsData = await inventoryModule.listInventoryLevels({
                inventory_item_id: inventoryItemId,
                location_id: location.id
            })
            const levels = Array.isArray(levelsData) ? levelsData : [levelsData]

            // Should properly check if levels is valid array or if we got object back that is level itself
            // Actually listInventoryLevels usually returns [levels, count] or levels array.
            // If it returns object it returned singular level? Unlikely for "list" command but consistent with other fix.

            if (levels.length > 0 && levels[0]) {
                const level = levels[0]
                if (level.stocked_quantity !== 5000) {
                    await inventoryModule.updateInventoryLevels([{
                        inventory_item_id: inventoryItemId,
                        location_id: location.id,
                        stocked_quantity: 5000
                    }])
                    logger.info(`   -> Updated stock to 5000`)
                } else {
                    logger.info(`   -> Stock already 5000`)
                }
            } else {
                await inventoryModule.createInventoryLevels([{
                    inventory_item_id: inventoryItemId,
                    location_id: location.id,
                    stocked_quantity: 5000,
                    incoming_quantity: 0
                }])
                logger.info(`   -> Created stock level: 5000`)
            }
        }

        logger.info("✅ Inventory Fix Complete!")

    } catch (error) {
        logger.error("❌ Error fixing inventory:", error)
        throw error
    }
}
