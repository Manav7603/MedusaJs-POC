import TelecomCoreModule from "../modules/telecom-core"
import CustomerModule from "@medusajs/medusa/customer"
import { defineLink } from "@medusajs/framework/utils"

/**
 * One-to-Many Link: Customer ↔ Subscription
 * Each Customer can have multiple Subscriptions (telecom lines)
 */
export default defineLink(
    CustomerModule.linkable.customer,
    {
        linkable: TelecomCoreModule.linkable.subscription,
        isList: true,
    }
)
