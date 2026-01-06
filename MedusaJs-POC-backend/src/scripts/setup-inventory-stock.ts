import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Script: Setup Inventory Stock (Updated)
 * 
 * - Physical devices (phones, accessories): 500 units in India location
 * - Digital services (plans, add-ons): Unlimited (no inventory management)
 */
export default async function setupInventoryStock({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const inventoryModule = container.resolve(Modules.INVENTORY)
    const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
    const productModule = container.resolve(Modules.PRODUCT)

    logger.info("📦 Setting up Inventory Stock...")

    try {
        // 1. Create or get "India" stock location
        logger.info("\n📍 Step 1: Creating India stock location...")

        let indiaLocation
        const existingLocations = await stockLocationModule.listStockLocations({
            name: "India Warehouse"
        })

        if (existingLocations.length > 0) {
            indiaLocation = existingLocations[0]
            logger.info(`✅ India location already exists: ${indiaLocation.id}`)
        } else {
            indiaLocation = await stockLocationModule.createStockLocations({
                name: "India Warehouse",
                address: {
                    address_1: "123 Tech Park",
                    city: "Mumbai",
                    country_code: "IN",
                    postal_code: "400001"
                }
            })
            logger.info(`✅ Created India location: ${indiaLocation.id}`)
        }

        // 2. Get all products
        logger.info("\n📱 Step 2: Fetching all products...")

        const products = await productModule.listProducts({}, {
            relations: ["variants"]
        })

        logger.info(`Found ${products.length} products`)

        // 3. Categorize products
        const physicalProducts = []
        const digitalServices = []

        for (const product of products) {
            const metadata = product.metadata || {}
            const title = product.title?.toLowerCase() || ""

            // Digital services: plans and data add-ons
            if (metadata.telecom_type === "plan" ||
                title.includes("data booster") ||
                title.includes("add-on")) {
                digitalServices.push(product)
            } else {
                // Physical products: phones, accessories
                physicalProducts.push(product)
            }
        }

        logger.info(`� Physical products (phones, accessories): ${physicalProducts.length}`)
        logger.info(`♾️  Digital services (plans, add-ons): ${digitalServices.length}`)

        // 4. Add stock for physical products (500 units each)
        logger.info("\n📦 Step 3: Adding stock for physical products...")

        for (const product of physicalProducts) {
            for (const variant of product.variants || []) {
                try {
                    // Get or create inventory item
                    let inventoryItems = await inventoryModule.listInventoryItems({
                        sku: variant.sku
                    })

                    let inventoryItem
                    if (inventoryItems.length === 0) {
                        inventoryItem = await inventoryModule.createInventoryItems({
                            sku: variant.sku,
                            title: variant.title || product.title
                        })
                    } else {
                        inventoryItem = inventoryItems[0]
                    }

                    // Create inventory level for India location
                    const existingLevels = await inventoryModule.listInventoryLevels({
                        inventory_item_id: inventoryItem.id,
                        location_id: indiaLocation.id
                    })

                    if (existingLevels.length === 0) {
                        await inventoryModule.createInventoryLevels({
                            inventory_item_id: inventoryItem.id,
                            location_id: indiaLocation.id,
                            stocked_quantity: 500,
                            incoming_quantity: 0
                        })
                        logger.info(`  ✅ Added 500 units: ${product.title} - ${variant.title || variant.sku}`)
                    } else {
                        await inventoryModule.updateInventoryLevels({
                            inventory_item_id: inventoryItem.id,
                            location_id: indiaLocation.id,
                            stocked_quantity: 500
                        })
                        logger.info(`  ✅ Updated to 500 units: ${product.title} - ${variant.title || variant.sku}`)
                    }

                } catch (error) {
                    logger.error(`  ❌ Error adding stock for ${variant.sku}:`, error.message)
                }
            }
        }

        // 5. Make digital services unlimited (disable inventory management)
        logger.info("\n♾️  Step 4: Making digital services unlimited...")

        for (const product of digitalServices) {
            for (const variant of product.variants || []) {
                try {
                    // Update variant to not manage inventory
                    await productModule.updateProductVariants({
                        id: variant.id,
                        manage_inventory: false
                    })
                    logger.info(`  ✅ Made unlimited: ${product.title}`)
                } catch (error) {
                    logger.error(`  ❌ Error updating ${variant.sku}:`, error.message)
                }
            }
        }

        // Summary
        logger.info("\n" + "=".repeat(60))
        logger.info("✅ Inventory Setup Complete!")
        logger.info("=".repeat(60))
        logger.info(`📍 Location: India Warehouse (${indiaLocation.id})`)
        logger.info(`📦 Physical products stocked: ${physicalProducts.length} (500 units each)`)
        logger.info(`♾️  Digital services unlimited: ${digitalServices.length}`)
        logger.info("=".repeat(60))

    } catch (error) {
        logger.error("❌ Inventory setup failed:", error)
        throw error
    }
}
