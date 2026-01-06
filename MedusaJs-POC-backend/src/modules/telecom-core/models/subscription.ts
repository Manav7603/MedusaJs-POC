import { model } from "@medusajs/framework/utils"

/**
 * Subscription is the central record of an active telecom line
 * Links to Customer and MsisdnInventory
 */
const Subscription = model.define("subscription", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    status: model.enum(["active", "suspended", "barred"]),
    msisdn_id: model.text(),
    current_period_start: model.dateTime(),
    renewal_date: model.dateTime(),
    billing_day: model.number(),
})

export default Subscription
