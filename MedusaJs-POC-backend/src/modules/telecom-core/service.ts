import { MedusaService } from "@medusajs/framework/utils"
import PlanConfiguration from "./models/plan-configuration"
import MsisdnInventory from "./models/msisdn-inventory"
import Subscription from "./models/subscription"
import UsageCounter from "./models/usage-counter"

/**
 * TelecomCoreModuleService
 * Main service for the telecom-core module
 * Provides access to all telecom-specific data models
 */
class TelecomCoreModuleService extends MedusaService({
    PlanConfiguration,
    MsisdnInventory,
    Subscription,
    UsageCounter,
}) { }

export default TelecomCoreModuleService
