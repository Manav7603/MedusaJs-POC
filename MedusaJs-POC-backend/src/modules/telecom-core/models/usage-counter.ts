import { model } from "@medusajs/framework/utils"

/**
 * UsageCounter tracks consumption for subscriptions
 * Stores data and voice usage per billing cycle
 */
const UsageCounter = model.define("usage_counter", {
    id: model.id().primaryKey(),
    subscription_id: model.text(),
    cycle_month: model.text(), // Format: 'YYYY-MM' e.g., '2024-05'
    data_used: model.number().default(0),
    voice_used: model.number().default(0),
})

export default UsageCounter
