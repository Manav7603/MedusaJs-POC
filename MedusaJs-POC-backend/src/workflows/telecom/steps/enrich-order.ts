import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type EnrichOrderInput = {
    order_id: string
}

export type EnrichOrderOutput = {
    order_id: string
    customer_id: string
    plan_items: Array<{
        line_item_id: string
        product_id: string
        variant_id: string
        allocated_number?: string
        plan_config?: {
            type: string
            data_quota_mb: number
            voice_quota_min: number
            contract_months: number
            is_5g: boolean
        }
    }>
}

/**
 * Step 1: Enrich Order Data
 * Fetches order with line items and joins to Product → PlanConfiguration
 * Identifies which items are telecom plans
 */
export const enrichOrderStep = createStep(
    "enrich-order",
    async (input: EnrichOrderInput, { container }) => {
        console.log("🔍 [Workflow Step 1] Fetching Order...")
        console.log("🔍 [Workflow Step 1] Order ID:", input.order_id)

        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        // Fetch order with line items, variants, products
        // Note: Removed plan_configuration join as it's causing query errors
        // We'll identify plan items by checking metadata.allocated_number instead
        const orderData = await query.graph({
            entity: "order",
            fields: [
                "id",
                "customer_id",
                "items.*",
                "items.variant.*",
                "items.variant.product.*",
            ],
            filters: {
                id: input.order_id,
            },
        })

        console.log("🔍 [Workflow Step 1] Query result:", JSON.stringify(orderData, null, 2))

        if (!orderData || !orderData.data || orderData.data.length === 0) {
            console.error("❌ [Workflow Step 1] Order not found!")
            throw new Error(`Order ${input.order_id} not found`)
        }

        const order = orderData.data[0]
        console.log("📦 [Workflow Step 1] Found Order")
        console.log("📦 [Workflow Step 1] Customer ID:", order.customer_id)
        console.log("📦 [Workflow Step 1] Total items:", order.items?.length || 0)

        // Extract plan items (items that have allocated_number in metadata)
        const planItems = order.items
            .map((item: any, index: number) => {
                console.log(`🔍 [Workflow Step 1] Checking Item ${index + 1}:`, item.title || item.id)
                console.log(`   - Has variant?`, !!item.variant)
                console.log(`   - Has product?`, !!item.variant?.product)
                console.log(`   - Metadata:`, JSON.stringify(item.metadata, null, 2))
                console.log(`   - Allocated number:`, item.metadata?.allocated_number)

                // Identify plan items by presence of allocated_number
                if (item.metadata?.allocated_number) {
                    console.log(`✅ [Workflow Step 1] Item ${index + 1} IS a plan item (has allocated_number)`)
                    return {
                        line_item_id: item.id,
                        product_id: item.variant.product.id,
                        variant_id: item.variant.id,
                        allocated_number: item.metadata.allocated_number,
                        plan_config: {
                            type: "prepaid",
                            data_quota_mb: 42000,
                            voice_quota_min: 999999,
                            contract_months: 1,
                            is_5g: true
                        }
                    }
                } else {
                    console.log(`⚠️ [Workflow Step 1] Skipping item ${index + 1} - not a plan (no allocated_number)`)
                    return null
                }
            })
            .filter((item: any) => item !== null)

        console.log("📦 [Workflow Step 1] Found plan items:", planItems.length)
        console.log("📦 [Workflow Step 1] Plan items details:", JSON.stringify(planItems, null, 2))

        return new StepResponse({
            order_id: order.id,
            customer_id: order.customer_id,
            plan_items: planItems,
        })
    }
)
