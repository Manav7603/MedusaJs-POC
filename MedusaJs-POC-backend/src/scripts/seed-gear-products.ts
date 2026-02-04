
import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Seed Gear Products (Phones, Accessories, etc.)
 * Creates comprehensive product catalog with proper pricing in both INR and USD
 * Run: npx medusa exec ./src/scripts/seed-gear-products.ts
 */
export default async function seedGearProducts({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const productModule = container.resolve(Modules.PRODUCT)
    const currencyModule = container.resolve(Modules.CURRENCY)
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
    const inventoryModule = container.resolve(Modules.INVENTORY)
    const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

    logger.info("📦 Seeding Gear Products (Phones & Accessories)...")

    try {
        // 1. Check currencies exist (INR and USD should be created via admin or migration)
        logger.info("💰 Note: Products will have prices in both INR, USD and EUR")

        // Conversion rate: 1 USD ≈ 83 INR
        const USD_TO_INR_RATE = 83

        // Helper function to create prices for all currencies
        const createPrices = (inrAmount: number) => {
            const usdAmount = Math.round(inrAmount / 83)
            const eurAmount = Math.round(usdAmount * 0.92)
            return [
                { amount: inrAmount, currency_code: "inr" },
                { amount: usdAmount, currency_code: "usd" },
                { amount: eurAmount, currency_code: "eur" }
            ]
        }

        // 2. Get or create categories
        logger.info("📁 Setting up categories...")
        const categoryMap: Record<string, any> = {}

        for (const catName of ["Smartphones", "Accessories", "Gear"]) {
            const handle = catName.toLowerCase()
            const [existing] = await productModule.listProductCategories({ handle })

            if (existing) {
                categoryMap[catName] = existing
                logger.info(`ℹ️  Category already exists: ${catName}`)
            } else {
                const category = await productModule.createProductCategories({
                    name: catName,
                    handle,
                    is_active: true,
                    is_internal: false
                })
                categoryMap[catName] = category
                logger.info(`✅ Created category: ${catName}`)
            }
        }

        // 3. Get sales channels (India & France)
        const [indiaChannel] = await salesChannelModule.listSalesChannels({ name: "India Sales Channel" })
        const [franceChannel] = await salesChannelModule.listSalesChannels({ name: "France Sales Channel" })
        const allChannels = await salesChannelModule.listSalesChannels({})

        // Fallback or use specific channels
        const scIndia = indiaChannel || allChannels.find(c => c.name.toLowerCase().includes("india")) || allChannels[0]
        const scFrance = franceChannel || allChannels.find(c => c.name.toLowerCase().includes("france")) || allChannels[0]

        if (!scIndia) {
            throw new Error("No Sales Channel found. Please create one in Medusa Admin.")
        }

        logger.info(`Using Sales Channels: India (${scIndia.name}), France (${scFrance.name})`)

        // 4. Helper function to create product if it doesn't exist
        const createProductIfNotExists = async (handle: string, productData: any) => {
            const [existing] = await productModule.listProducts({ handle })
            if (existing) {
                logger.info(`ℹ️  Product already exists: ${productData.title} - skipping`)
                return existing
            }

            // Ensure sales_channels is set correctly if not provided
            if (!productData.sales_channels) {
                productData.sales_channels = [{ id: scIndia.id }, { id: scFrance.id }]
            }

            try {
                const { result } = await createProductsWorkflow(container).run({
                    input: { products: [productData] }
                })

                const created = result[0]
                logger.info(`✅ Created: ${productData.title} (ID: ${created.id})`)
                return created
            } catch (error: any) {
                // Handle case where product or variant already exists (race condition)
                if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
                    logger.warn(`⚠️  Product or variant already exists for ${productData.title} - skipping`)
                    const [existingProduct] = await productModule.listProducts({ handle })
                    return existingProduct || null
                }
                // Re-throw other errors
                throw error
            }
        }

        // 5. Create Smartphones - UPDATED with Images & New Products
        // iPhone 15 Pro
        await createProductIfNotExists("iphone-15-pro", {
            title: "iPhone 15 Pro",
            handle: "iphone-15-pro",
            subtitle: "Titanium. A17 Pro chip. Action button.",
            description: "The iPhone 15 Pro features a titanium design, A17 Pro chip, and advanced camera system. Available in multiple storage options and colors.",
            status: "published",
            category_ids: [categoryMap["Smartphones"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override

            images: [
                { url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium" },
                { url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-blacktitanium" },
                { url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-whitetitanium" }
            ],
            options: [
                { title: "Storage", values: ["128GB", "256GB"] },
                { title: "Color", values: ["Natural Titanium", "Black Titanium"] }
            ],
            variants: [
                {
                    title: "Natural Titanium / 128GB",
                    sku: "IP15P-NAT-128",
                    manage_inventory: true,
                    options: { Storage: "128GB", Color: "Natural Titanium" },
                    prices: createPrices(134900)
                },
                {
                    title: "Black Titanium / 256GB",
                    sku: "IP15P-BLK-256",
                    manage_inventory: true,
                    options: { Storage: "256GB", Color: "Black Titanium" },
                    prices: createPrices(144900)
                }
            ]
        })

        // Google Pixel 8 Pro
        await createProductIfNotExists("pixel-8-pro", {
            title: "Google Pixel 8 Pro",
            handle: "pixel-8-pro",
            subtitle: "The AI-first phone from Google",
            description: "Meet Pixel 8 Pro. It has a polished aluminum frame and matte back glass. The Google Tensor G3 chip works with Google AI to deliver cutting-edge photo and video features.",
            status: "published",
            category_ids: [categoryMap["Smartphones"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override

            images: [
                { url: "https://lh3.googleusercontent.com/f2o-S_w-FzRkFq_6gCo7lB3YyC2g7uw7V3k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5" },
                { url: "https://lh3.googleusercontent.com/Gj8Vvj5M_7yqT5y7c5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5" }
            ],
            options: [
                { title: "Color", values: ["Bay", "Obsidian", "Porcelain"] },
                { title: "Storage", values: ["128GB", "256GB"] }
            ],
            variants: [
                {
                    title: "Bay / 128GB",
                    sku: "P8P-BAY-128",
                    manage_inventory: true,
                    options: { Color: "Bay", Storage: "128GB" },
                    prices: createPrices(106999)
                },
                {
                    title: "Obsidian / 256GB",
                    sku: "P8P-OBS-256",
                    manage_inventory: true,
                    options: { Color: "Obsidian", Storage: "256GB" },
                    prices: createPrices(113999)
                }
            ]
        })

        // Nothing Phone (2a)
        await createProductIfNotExists("nothing-phone-2a", {
            title: "Nothing Phone (2a)",
            handle: "nothing-phone-2a",
            subtitle: "Powerfully unique",
            description: "A new icon is born. Featuring the unique Glyph Interface, a 50 MP dual camera, and nothing OS 2.5.",
            status: "published",
            category_ids: [categoryMap["Smartphones"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override

            images: [
                { url: "https://nothing.tech/cdn/shop/files/Phone2a_Black_1.png?v=1709636735" },
                { url: "https://nothing.tech/cdn/shop/files/Phone2a_Milk_1.png?v=1709636735" }
            ],
            options: [
                { title: "Color", values: ["Black", "Milk"] },
                { title: "RAM/Storage", values: ["8GB/128GB", "12GB/256GB"] }
            ],
            variants: [
                {
                    title: "Black / 8GB/128GB",
                    sku: "NP2A-BLK-8-128",
                    manage_inventory: true,
                    options: { Color: "Black", "RAM/Storage": "8GB/128GB" },
                    prices: createPrices(23999)
                },
                {
                    title: "Milk / 12GB/256GB",
                    sku: "NP2A-WHT-12-256",
                    manage_inventory: true,
                    options: { Color: "Milk", "RAM/Storage": "12GB/256GB" },
                    prices: createPrices(27999)
                }
            ]
        })

        // 6. Create Accessories - ADDING IMAGES
        logger.info("🎧 Creating accessories...")

        // AirPods Pro (2nd Gen)
        await createProductIfNotExists("airpods-pro-2", {
            title: "AirPods Pro (2nd Gen)",
            handle: "airpods-pro-2",
            subtitle: "Active Noise Cancellation. Spatial Audio.",
            description: "Premium wireless earbuds with Active Noise Cancellation, Adaptive Transparency, and Spatial Audio with dynamic head tracking.",
            status: "published",
            category_ids: [categoryMap["Accessories"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override

            images: [
                { url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83" },
                { url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83_AV1" }
            ],
            options: [{ title: "Type", values: ["Standard"] }],
            variants: [
                {
                    title: "Standard",
                    sku: "AIRPODS-PRO-2",
                    manage_inventory: true,
                    options: { Type: "Standard" },
                    prices: createPrices(24900)
                }
            ]
        })

        // Sony WH-1000XM5
        await createProductIfNotExists("sony-wh-1000xm5", {
            title: "Sony WH-1000XM5",
            handle: "sony-wh-1000xm5",
            subtitle: "Industry-leading Noise Cancellation",
            description: "The best noise cancelling headphones from Sony. Exceptional sound quality, crystal clear hands-free calling, and up to 30 hours battery life.",
            status: "published",
            category_ids: [categoryMap["Accessories"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override

            images: [
                { url: "https://www.sony.co.in/image/6145c1d32e6ac8e63a46c912dc83c504?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF" },
                { url: "https://www.sony.co.in/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF" }
            ],
            options: [{ title: "Color", values: ["Black", "Silver"] }],
            variants: [
                {
                    title: "Black",
                    sku: "SONY-XM5-BLK",
                    manage_inventory: true,
                    options: { Color: "Black" },
                    prices: createPrices(29990)
                },
                {
                    title: "Silver",
                    sku: "SONY-XM5-SLV",
                    manage_inventory: true,
                    options: { Color: "Silver" },
                    prices: createPrices(29990)
                }
            ]
        })

        // USB-C Fast Charger
        await createProductIfNotExists("usb-c-fast-charger-20w", {
            title: "USB-C Fast Charger 20W",
            handle: "usb-c-fast-charger-20w",
            subtitle: "Fast charging power adapter",
            description: "20W USB-C power adapter for fast charging of iPhones, iPads, and other USB-C devices.",
            status: "published",
            category_ids: [categoryMap["Accessories"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override

            images: [
                { url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MHXH3" } // MagSafe/Adapter generic
            ],
            options: [{ title: "Type", values: ["Standard"] }],
            variants: [
                {
                    title: "Standard",
                    sku: "CHARGER-USBC-20W",
                    manage_inventory: true,
                    options: { Type: "Standard" },
                    prices: createPrices(1900)
                }
            ]
        })

        // Wireless Charging Pad
        await createProductIfNotExists("wireless-charging-pad", {
            title: "Wireless Charging Pad",
            handle: "wireless-charging-pad",
            subtitle: "15W fast wireless charging",
            description: "15W fast wireless charging pad compatible with Qi-enabled devices.",
            status: "published",
            category_ids: [categoryMap["Accessories"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override
            images: [
                { url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/HQ3F2" }
            ],
            options: [{ title: "Type", values: ["Standard"] }],
            variants: [
                {
                    title: "Standard",
                    sku: "WIRELESS-CHARGER-15W",
                    manage_inventory: true,
                    options: { Type: "Standard" },
                    prices: createPrices(1499)
                }
            ]
        })

        // 7. iPad Air (Tablet Category)
        await createProductIfNotExists("ipad-air-m2", {
            title: "iPad Air (M2)",
            handle: "ipad-air-m2",
            subtitle: "Serious performance in a thin and light design.",
            description: "Turbocharged by the Apple M2 chip. 11-inch or 13-inch Liquid Retina display.",
            status: "published",
            category_ids: [categoryMap["Gear"].id],
            // sales_channels: handled by createProductIfNotExists default or specific override
            images: [
                { url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-finish-select-202405-11inch-space-gray" },
                { url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-finish-select-202405-11inch-blue" }
            ],
            options: [
                { title: "Size", values: ["11-inch", "13-inch"] },
                { title: "Storage", values: ["128GB", "256GB"] }
            ],
            variants: [
                {
                    title: "11-inch / 128GB",
                    sku: "IPAD-AIR-11-128",
                    manage_inventory: true,
                    options: { Size: "11-inch", Storage: "128GB" },
                    prices: createPrices(59900)
                },
                {
                    title: "13-inch / 256GB",
                    sku: "IPAD-AIR-13-256",
                    manage_inventory: true,
                    options: { Size: "13-inch", Storage: "256GB" },
                    prices: createPrices(79900)
                }
            ]
        })

        logger.info("✅ Comprehensive Data Seed Completed!")

    } catch (error) {
        logger.error("❌ Error seeding gear products:", error)
        throw error
    }
}
