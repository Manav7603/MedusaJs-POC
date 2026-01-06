import TelecomCoreModule from "../modules/telecom-core"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

/**
 * One-to-One Link: Product ↔ PlanConfiguration
 * Each Product can have one PlanConfiguration with technical telecom details
 */
export default defineLink(
    ProductModule.linkable.product,
    TelecomCoreModule.linkable.planConfiguration
)
