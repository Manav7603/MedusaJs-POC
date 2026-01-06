import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import TelecomCoreModuleService from "../modules/telecom-core/service"

export default async function seedTelecomCatalog({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const productModule = container.resolve(Modules.PRODUCT)
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
    const telecomModule: TelecomCoreModuleService = container.resolve("telecom")

    logger.info("📦 Seeding Telecom Device Catalog...")

    try {
        // Helper function to create product if it doesn't exist
        const createProductIfNotExists = async (handle: string, productData: any) => {
            const [existing] = await productModule.listProducts({ handle })
            if (existing) {
                logger.info(`ℹ️  Product already exists: ${productData.title}`)
                return existing
            }

            await createProductsWorkflow(container).run({
                input: { products: [productData] }
            })

            const [created] = await productModule.listProducts({ handle })
            logger.info(`✅ Created: ${productData.title}`)
            return created
        }

        // 1. Get or create categories
        logger.info("📁 Setting up categories...")
        const categoryMap: Record<string, any> = {}

        for (const catName of ["Smartphones", "Accessories", "Plans"]) {
            const handle = catName.toLowerCase()
            const [existing] = await productModule.listProductCategories({ handle })

            if (existing) {
                categoryMap[catName] = existing
            } else {
                const category = await productModule.createProductCategories({
                    name: catName,
                    handle,
                    is_active: true,
                    is_internal: false
                })
                logger.info(`✅ Created category: ${catName}`)
                categoryMap[catName] = category
            }
        }

        // 2. Get default sales channel
        const [salesChannel] = await salesChannelModule.listSalesChannels({
            name: "Default Sales Channel"
        })

        if (!salesChannel) {
            throw new Error("Default Sales Channel not found")
        }

        // 3. Create products
        logger.info("📱 Creating products...")

        // iPhone 15
        await createProductIfNotExists("iphone-15", {
            title: "iPhone 15",
            handle: "iphone-15",
            description: "Latest iPhone with A17 chip, advanced camera system, and USB-C",
            status: "published",
            category_ids: [categoryMap["Smartphones"].id],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                brand: "Apple",
                model: "iPhone 15",
                year: "2023",
                connectivity: "5G",
                screen_size: "6.1 inches"
            },
            options: [
                { title: "Color", values: ["Black", "Blue", "Pink"] },
                { title: "Storage", values: ["128GB", "256GB", "512GB"] }
            ],
            variants: [
                {
                    title: "Black / 128GB",
                    sku: "IPHONE15-BLK-128",
                    manage_inventory: false,
                    options: { Color: "Black", Storage: "128GB" },
                    prices: [{ amount: 79900, currency_code: "usd" }]
                },
                {
                    title: "Blue / 256GB",
                    sku: "IPHONE15-BLU-256",
                    manage_inventory: false,
                    options: { Color: "Blue", Storage: "256GB" },
                    prices: [{ amount: 89900, currency_code: "usd" }]
                }
            ]
        })

        // Samsung Galaxy S24
        await createProductIfNotExists("samsung-galaxy-s24", {
            title: "Samsung Galaxy S24",
            handle: "samsung-galaxy-s24",
            description: "Flagship Android phone with AI features and stunning display",
            status: "published",
            category_ids: [categoryMap["Smartphones"].id],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                brand: "Samsung",
                model: "Galaxy S24",
                year: "2024",
                connectivity: "5G",
                screen_size: "6.2 inches"
            },
            options: [
                { title: "Color", values: ["Black", "Violet", "Yellow"] },
                { title: "Storage", values: ["128GB", "256GB"] }
            ],
            variants: [
                {
                    title: "Black / 128GB",
                    sku: "GALAXY-S24-BLK-128",
                    manage_inventory: false,
                    options: { Color: "Black", Storage: "128GB" },
                    prices: [{ amount: 79999, currency_code: "usd" }]
                },
                {
                    title: "Violet / 256GB",
                    sku: "GALAXY-S24-VIO-256",
                    manage_inventory: false,
                    options: { Color: "Violet", Storage: "256GB" },
                    prices: [{ amount: 85999, currency_code: "usd" }]
                }
            ]
        })

        // USB-C Charger - SKIPPED (has existing product without options)
        // await createProductIfNotExists("usb-c-charger", {
        //     title: "USB-C Fast Charger 20W",
        //     handle: "usb-c-charger",
        //     description: "Fast charging USB-C power adapter compatible with all modern devices",
        //     status: "published",
        //     category_ids: [categoryMap["Accessories"].id],
        //     sales_channels: [{ id: salesChannel.id }],
        //     metadata: {
        //         type: "charger",
        //         power: "20W",
        //         connector: "USB-C"
        //     },
        //     options: [],
        //     variants: [
        //         {
        //             title: "Standard",
        //             sku: "CHARGER-USBC-20W",
        //             manage_inventory: false,
        //             prices: [{ amount: 2900, currency_code: "usd" }]
        //         }
        //     ]
        // })

        // AirPods Pro
        await createProductIfNotExists("airpods-pro", {
            title: "AirPods Pro (2nd Gen)",
            handle: "airpods-pro",
            description: "Premium wireless earbuds with active noise cancellation",
            status: "published",
            category_ids: [categoryMap["Accessories"].id],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                brand: "Apple",
                type: "earbuds",
                features: "ANC, Spatial Audio, Transparency Mode"
            },
            options: [{ title: "Type", values: ["Standard"] }],
            variants: [
                {
                    title: "Standard",
                    sku: "AIRPODS-PRO-2",
                    manage_inventory: false,
                    options: { Type: "Standard" },
                    prices: [{ amount: 24900, currency_code: "usd" }]
                }
            ]
        })

        // Screen Protector
        await createProductIfNotExists("tempered-glass-protector", {
            title: "Tempered Glass Screen Protector",
            handle: "tempered-glass-protector",
            description: "9H hardness screen protector for smartphones",
            status: "published",
            category_ids: [categoryMap["Accessories"].id],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                type: "screen-protector",
                material: "tempered-glass",
                hardness: "9H"
            },
            options: [{ title: "Type", values: ["Standard"] }],
            variants: [
                {
                    title: "Standard",
                    sku: "SCREEN-PROT-GLASS",
                    manage_inventory: false,
                    options: { Type: "Standard" },
                    prices: [{ amount: 999, currency_code: "usd" }]
                }
            ]
        })

        // Data Boosters
        await createProductIfNotExists("data-booster-1gb", {
            title: "Data Booster 1GB",
            handle: "data-booster-1gb",
            description: "Add 1GB of high-speed 5G data to your plan",
            status: "published",
            category_ids: [categoryMap["Plans"].id],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "addon",
                data_amount: "1GB",
                validity: "30 days"
            },
            options: [{ title: "Type", values: ["Add-on"] }],
            variants: [
                {
                    title: "Add-on",
                    sku: "ADDON-DATA-1GB",
                    manage_inventory: false,
                    options: { Type: "Add-on" },
                    prices: [{ amount: 500, currency_code: "usd" }]
                }
            ]
        })

        await createProductIfNotExists("data-booster-5gb", {
            title: "Data Booster 5GB",
            handle: "data-booster-5gb",
            description: "Add 5GB of high-speed 5G data to your plan",
            status: "published",
            category_ids: [categoryMap["Plans"].id],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "addon",
                data_amount: "5GB",
                validity: "30 days"
            },
            options: [{ title: "Type", values: ["Add-on"] }],
            variants: [
                {
                    title: "Add-on",
                    sku: "ADDON-DATA-5GB",
                    manage_inventory: false,
                    options: { Type: "Add-on" },
                    prices: [{ amount: 2000, currency_code: "usd" }]
                }
            ]
        })

        await createProductIfNotExists("data-booster-10gb", {
            title: "Data Booster 10GB",
            handle: "data-booster-10gb",
            description: "Add 10GB of high-speed 5G data to your plan",
            status: "published",
            category_ids: [categoryMap["Plans"].id],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "addon",
                data_amount: "10GB",
                validity: "30 days"
            },
            options: [{ title: "Type", values: ["Add-on"] }],
            variants: [
                {
                    title: "Add-on",
                    sku: "ADDON-DATA-10GB",
                    manage_inventory: false,
                    options: { Type: "Add-on" },
                    prices: [{ amount: 3500, currency_code: "usd" }]
                }
            ]
        })

        // Summary
        logger.info("=".repeat(60))
        logger.info("✅ Telecom Catalog Seeded Successfully!")
        logger.info("=".repeat(60))
        logger.info("📱 Smartphones: iPhone 15, Samsung Galaxy S24")
        logger.info("🎧 Accessories: Charger, AirPods Pro, Screen Protector")
        logger.info("📊 Add-ons: 1GB, 5GB, 10GB Data Boosters")
        logger.info("=".repeat(60))

    } catch (error) {
        logger.error("❌ Error seeding catalog:", error)
        throw error
    }
}
