import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import TelecomCoreModuleService from "../modules/telecom-core/service"

export default async function seedIndianPlans({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const productModule = container.resolve(Modules.PRODUCT)
    const storeModule = container.resolve(Modules.STORE)
    const currencyModule = container.resolve(Modules.CURRENCY)
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
    const telecomModule: TelecomCoreModuleService = container.resolve("telecom")

    logger.info("🇮🇳 Seeding Indian Telecom Plans...")

    try {
        // 1. Ensure INR currency exists
        logger.info("💰 Checking INR currency...")

        const currencies = await currencyModule.listCurrencies({ code: "inr" })

        if (currencies.length === 0) {
            await currencyModule.createCurrencies({
                code: "inr",
                symbol: "₹",
                symbol_native: "₹",
                name: "Indian Rupee"
            })
            logger.info("✅ Created INR currency")
        } else {
            logger.info("ℹ️  INR currency already exists")
        }

        // 2. Get or create Plans category
        logger.info("📁 Setting up Plans category...")
        const [plansCategory] = await productModule.listProductCategories({ handle: "plans" })

        let categoryId
        if (plansCategory) {
            categoryId = plansCategory.id
        } else {
            const category = await productModule.createProductCategories({
                name: "Plans",
                handle: "plans",
                is_active: true,
                is_internal: false
            })
            categoryId = category.id
            logger.info("✅ Created Plans category")
        }

        // 3. Get default sales channel
        const [salesChannel] = await salesChannelModule.listSalesChannels({
            name: "Default Sales Channel"
        })

        if (!salesChannel) {
            throw new Error("Default Sales Channel not found")
        }

        // 4. Helper function to create plan if it doesn't exist
        const createPlanIfNotExists = async (handle: string, planData: any) => {
            const [existing] = await productModule.listProducts({ handle })
            if (existing) {
                logger.info(`ℹ️  Plan already exists: ${planData.title}`)
                return existing
            }

            await createProductsWorkflow(container).run({
                input: { products: [planData] }
            })

            const [created] = await productModule.listProducts({ handle })
            logger.info(`✅ Created: ${planData.title}`)
            return created
        }

        // 5. Create Indian Plans
        logger.info("📱 Creating Indian telecom plans...")

        // Hero Unlimited 299 (28 days, 1.5GB/day)
        await createPlanIfNotExists("hero-299", {
            title: "Hero Unlimited 299",
            handle: "hero-299",
            description: "Unlimited calls + 1.5GB/day data for 28 days",
            status: "published",
            category_ids: [categoryId],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "plan",
                plan_type: "prepaid",
                validity_days: "28",
                daily_data_gb: "1.5",
                total_data_gb: "42",
                voice: "Unlimited",
                sms: "100/day",
                network: "4G/5G",
                popular: "true"
            },
            options: [{ title: "Type", values: ["Prepaid"] }],
            variants: [{
                title: "Prepaid",
                sku: "PLAN-HERO-299",
                manage_inventory: false,
                options: { Type: "Prepaid" },
                prices: [
                    { amount: 29900, currency_code: "inr" }
                ]
            }]
        })

        // Hero Unlimited 719 (84 days, 2GB/day)
        await createPlanIfNotExists("hero-719", {
            title: "Hero Unlimited 719",
            handle: "hero-719",
            description: "Unlimited calls + 2GB/day data for 84 days",
            status: "published",
            category_ids: [categoryId],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "plan",
                plan_type: "prepaid",
                validity_days: "84",
                daily_data_gb: "2",
                total_data_gb: "168",
                voice: "Unlimited",
                sms: "100/day",
                network: "4G/5G",
                popular: "true"
            },
            options: [{ title: "Type", values: ["Prepaid"] }],
            variants: [{
                title: "Prepaid",
                sku: "PLAN-HERO-719",
                manage_inventory: false,
                options: { Type: "Prepaid" },
                prices: [
                    { amount: 71900, currency_code: "inr" }
                ]
            }]
        })

        // Additional Popular Plans

        // Value Plan - ₹199 (28 days, 1GB/day)
        await createPlanIfNotExists("value-199", {
            title: "Value Plan 199",
            handle: "value-199",
            description: "Unlimited calls + 1GB/day data for 28 days",
            status: "published",
            category_ids: [categoryId],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "plan",
                plan_type: "prepaid",
                validity_days: "28",
                daily_data_gb: "1",
                total_data_gb: "28",
                voice: "Unlimited",
                sms: "100/day",
                network: "4G"
            },
            options: [{ title: "Type", values: ["Prepaid"] }],
            variants: [{
                title: "Prepaid",
                sku: "PLAN-VALUE-199",
                manage_inventory: false,
                options: { Type: "Prepaid" },
                prices: [
                    { amount: 19900, currency_code: "inr" }
                ]
            }]
        })

        // Premium Plan - ₹999 (84 days, 2.5GB/day)
        await createPlanIfNotExists("premium-999", {
            title: "Premium Plan 999",
            handle: "premium-999",
            description: "Unlimited calls + 2.5GB/day data + OTT benefits for 84 days",
            status: "published",
            category_ids: [categoryId],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "plan",
                plan_type: "prepaid",
                validity_days: "84",
                daily_data_gb: "2.5",
                total_data_gb: "210",
                voice: "Unlimited",
                sms: "100/day",
                network: "5G",
                ott: "Disney+ Hotstar",
                popular: "true"
            },
            options: [{ title: "Type", values: ["Prepaid"] }],
            variants: [{
                title: "Prepaid",
                sku: "PLAN-PREMIUM-999",
                manage_inventory: false,
                options: { Type: "Prepaid" },
                prices: [
                    { amount: 99900, currency_code: "inr" }
                ]
            }]
        })

        // Annual Plan - ₹2999 (365 days, 2GB/day)
        await createPlanIfNotExists("annual-2999", {
            title: "Annual Plan 2999",
            handle: "annual-2999",
            description: "Unlimited calls + 2GB/day data for 365 days",
            status: "published",
            category_ids: [categoryId],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "plan",
                plan_type: "prepaid",
                validity_days: "365",
                daily_data_gb: "2",
                total_data_gb: "730",
                voice: "Unlimited",
                sms: "100/day",
                network: "4G/5G",
                popular: "true",
                best_value: "true"
            },
            options: [{ title: "Type", values: ["Prepaid"] }],
            variants: [{
                title: "Prepaid",
                sku: "PLAN-ANNUAL-2999",
                manage_inventory: false,
                options: { Type: "Prepaid" },
                prices: [
                    { amount: 299900, currency_code: "inr" }
                ]
            }]
        })

        // Postpaid Plan - ₹499/month
        await createPlanIfNotExists("postpaid-499", {
            title: "Postpaid Plan 499",
            handle: "postpaid-499",
            description: "Unlimited calls + 40GB data per month",
            status: "published",
            category_ids: [categoryId],
            sales_channels: [{ id: salesChannel.id }],
            metadata: {
                telecom_type: "plan",
                plan_type: "postpaid",
                validity_days: "30",
                monthly_data_gb: "40",
                voice: "Unlimited",
                sms: "Unlimited",
                network: "4G/5G",
                billing: "Monthly"
            },
            options: [{ title: "Type", values: ["Postpaid"] }],
            variants: [{
                title: "Postpaid",
                sku: "PLAN-POSTPAID-499",
                manage_inventory: false,
                options: { Type: "Postpaid" },
                prices: [
                    { amount: 49900, currency_code: "inr" }
                ]
            }]
        })

        // Create PlanConfigurations for key plans
        logger.info("⚙️  Creating plan configurations...")

        // Hero 299 Config
        const [hero299] = await productModule.listProducts({ handle: "hero-299" })
        if (hero299) {
            const existingConfigs = await telecomModule.listPlanConfigurations({
                product_id: hero299.id
            })

            if (existingConfigs.length === 0) {
                await telecomModule.createPlanConfigurations({
                    product_id: hero299.id,
                    type: "prepaid",
                    data_quota_mb: 42000, // 42GB
                    voice_quota_min: 999999, // Unlimited
                    contract_months: 0,
                    is_5g: true
                })
                logger.info("✅ Created config for Hero 299")
            }
        }

        // Hero 719 Config
        const [hero719] = await productModule.listProducts({ handle: "hero-719" })
        if (hero719) {
            const existingConfigs = await telecomModule.listPlanConfigurations({
                product_id: hero719.id
            })

            if (existingConfigs.length === 0) {
                await telecomModule.createPlanConfigurations({
                    product_id: hero719.id,
                    type: "prepaid",
                    data_quota_mb: 168000, // 168GB
                    voice_quota_min: 999999, // Unlimited
                    contract_months: 0,
                    is_5g: true
                })
                logger.info("✅ Created config for Hero 719")
            }
        }

        // Summary
        logger.info("=".repeat(60))
        logger.info("✅ Indian Telecom Plans Seeded Successfully!")
        logger.info("=".repeat(60))
        logger.info("📱 Prepaid Plans:")
        logger.info("   - Hero Unlimited 299 (₹299, 28 days, 1.5GB/day)")
        logger.info("   - Hero Unlimited 719 (₹719, 84 days, 2GB/day)")
        logger.info("   - Value Plan 199 (₹199, 28 days, 1GB/day)")
        logger.info("   - Premium Plan 999 (₹999, 84 days, 2.5GB/day)")
        logger.info("   - Annual Plan 2999 (₹2999, 365 days, 2GB/day)")
        logger.info("📞 Postpaid Plans:")
        logger.info("   - Postpaid Plan 499 (₹499/month, 40GB)")
        logger.info("=".repeat(60))

    } catch (error) {
        logger.error("❌ Error seeding Indian plans:", error)
        throw error
    }
}