import TelecomCoreModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const TELECOM_CORE_MODULE = "telecomCore"

/**
 * Telecom Core Module
 * Provides BSS-specific data models and services:
 * - PlanConfiguration: Technical details for products
 * - MsisdnInventory: Phone number pool management
 * - Subscription: Active line records
 * - UsageCounter: Consumption tracking
 */
export default Module(TELECOM_CORE_MODULE, {
    service: TelecomCoreModuleService,
})
