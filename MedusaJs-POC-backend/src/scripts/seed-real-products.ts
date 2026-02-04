
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function seedRealProducts({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
    const regionService = container.resolve(Modules.REGION)

    logger.info("Seeding realistic tech products...")

    // 1. Fetch Sales Channels
    const [indiaChannel] = await salesChannelService.listSalesChannels({ name: "India Sales Channel" })
    const [franceChannel] = await salesChannelService.listSalesChannels({ name: "France Sales Channel" })

    // Fallback defaults if specific ones aren't found (for robustness)
    const channels = await salesChannelService.listSalesChannels({})
    const scIndia = indiaChannel?.id || channels.find(c => c.name.includes("India"))?.id || channels[0].id
    const scFrance = franceChannel?.id || channels.find(c => c.name.includes("France"))?.id || channels[0].id

    logger.info(`Using SC India: ${scIndia}`)
    logger.info(`Using SC France: ${scFrance}`)

    // 2. Define Products
    const productsData = [
        {
            title: "iPhone 15 Pro",
            handle: "iphone-15-pro",
            description: "The first iPhone to feature an aerospace-grade titanium design.",
            status: ProductStatus.PUBLISHED,
            images: [
                { url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg" },
                { url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=2560&hei=1440&fmt=p-jpg" }
            ],
            options: [
                { title: "Color", values: ["Natural Titanium", "Black Titanium"] },
                { title: "Storage", values: ["128GB", "256GB"] }
            ],
            variants: [
                {
                    title: "Natural Titanium / 128GB",
                    sku: "IP15P-NAT-128",
                    options: { Color: "Natural Titanium", Storage: "128GB" },
                    prices: [
                        { currency_code: "inr", amount: 134900 },
                        { currency_code: "eur", amount: 1229 }
                    ]
                },
                {
                    title: "Black Titanium / 256GB",
                    sku: "IP15P-BLK-256",
                    options: { Color: "Black Titanium", Storage: "256GB" },
                    prices: [
                        { currency_code: "inr", amount: 144900 },
                        { currency_code: "eur", amount: 1359 }
                    ]
                }
            ],
            sales_channels: [{ id: scIndia }, { id: scFrance }]
        },
        {
            title: "Samsung Galaxy S24 Ultra",
            handle: "samsung-s24-ultra",
            description: "Galaxy AI is here. Welcome to the era of mobile AI.",
            status: ProductStatus.PUBLISHED,
            images: [
                { url: "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bztqins-539577667?$650_519_PNG$" }
            ],
            options: [
                { title: "Color", values: ["Titanium Gray", "Titanium Black"] },
                { title: "Storage", values: ["256GB", "512GB"] }
            ],
            variants: [
                {
                    title: "Titanium Gray / 256GB",
                    sku: "S24U-GRY-256",
                    options: { Color: "Titanium Gray", Storage: "256GB" },
                    prices: [
                        { currency_code: "inr", amount: 129999 },
                        { currency_code: "eur", amount: 1469 }
                    ]
                }
            ],
            sales_channels: [{ id: scIndia }, { id: scFrance }]
        },
        {
            title: "Google Pixel 8 Pro",
            handle: "pixel-8-pro",
            description: "The most advanced Pixel phones yet.",
            status: ProductStatus.PUBLISHED,
            images: [
                { url: "https://lh3.googleusercontent.com/f2o-S_w-FzRkFq_6gCo7lB3YyC2g7uw7V3k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5" } // Placeholder valid URI
            ],
            options: [
                { title: "Color", values: ["Bay", "Obsidian"] }
            ],
            variants: [
                {
                    title: "Bay",
                    sku: "P8P-BAY",
                    options: { Color: "Bay" },
                    prices: [
                        { currency_code: "inr", amount: 106999 }
                    ]
                }
            ],
            // INDIA ONLY
            sales_channels: [{ id: scIndia }]
        },
        {
            title: "MagSafe Charger",
            handle: "magsafe-charger",
            description: "Wireless charging. Snap. Charge.",
            status: ProductStatus.PUBLISHED,
            images: [
                { url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MHXH3?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1603996255000" }
            ],
            options: [
                { title: "Type", values: ["Standard"] }
            ],
            variants: [
                {
                    title: "Standard",
                    sku: "MAGSAFE-001",
                    options: { Type: "Standard" },
                    prices: [
                        { currency_code: "eur", amount: 49 }
                    ]
                }
            ],
            // FRANCE ONLY
            sales_channels: [{ id: scFrance }]
        }
    ]

    // 3. Execute Workflow
    logger.info("Creating products...")
    try {
        const { result } = await createProductsWorkflow(container).run({
            input: {
                products: productsData
            }
        })
        logger.info(`Successfully created ${result.length} products.`)
    } catch (e) {
        logger.error(`Failed to create products: ${e.message}`)
    }
}
