import { model } from "@medusajs/framework/utils"

/**
 * PlanConfiguration holds technical details for a Product
 * Links to Medusa's core Product entity via product_id
 */
const PlanConfiguration = model.define("plan_configuration", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    type: model.enum(["prepaid", "postpaid"]),
    data_quota_mb: model.number(),
    voice_quota_min: model.number(),
    contract_months: model.number(),
    is_5g: model.boolean().default(false),
})

export default PlanConfiguration
