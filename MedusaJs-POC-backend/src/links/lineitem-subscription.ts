import TelecomCoreModule from "../modules/telecom-core"
import CartModule from "@medusajs/medusa/cart"
import { defineLink } from "@medusajs/framework/utils"

/**
 * One-to-One Link: LineItem ↔ Subscription
 * Each cart LineItem can create one Subscription
 * This tracks which cart item initiated the subscription
 */
export default defineLink(
    CartModule.linkable.lineItem,
    TelecomCoreModule.linkable.subscription
)
