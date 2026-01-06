import { model } from "@medusajs/framework/utils"

/**
 * MsisdnInventory represents the phone number pool
 * Tracks availability status, tier, and regional assignment
 */
const MsisdnInventory = model.define("msisdn_inventory", {
    id: model.id().primaryKey(),
    phone_number: model.text().unique(),
    status: model.enum(["available", "reserved", "active", "cooling_down"]),
    tier: model.enum(["standard", "gold", "platinum"]),
    region_code: model.text(),
})

export default MsisdnInventory
