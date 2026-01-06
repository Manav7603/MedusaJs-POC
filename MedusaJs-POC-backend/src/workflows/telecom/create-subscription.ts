import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { enrichOrderStep } from "./steps/enrich-order"
import { validateReservationStep } from "./steps/validate-reservation"
import { createSubscriptionStep } from "./steps/create-subscription"
import { activateInventoryStep } from "./steps/activate-inventory"
import { initializeUsageStep } from "./steps/initialize-usage"

export type CreateSubscriptionWorkflowInput = {
    order_id: string
}

export type CreateSubscriptionWorkflowOutput = {
    subscriptions: Array<{
        subscription_id: string
        line_item_id: string
        msisdn_id: string
    }>
    activated_count: number
    initialized_count: number
}

/**
 * Create Subscription Workflow
 * 
 * This workflow handles the provisioning logic after an order is placed.
 * It converts the order into active subscriptions and "turns on" the SIM.
 * 
 * Steps:
 * 1. Enrich Order: Fetch order with line items and join to PlanConfiguration
 * 2. Validate Reservation: Check that allocated numbers are reserved
 * 3. Create Subscription: Create subscription records (with idempotency)
 * 4. Activate Inventory: Update MSISDN status from 'reserved' to 'active'
 * 5. Initialize Usage: Create usage counter for current billing period
 * 
 * Idempotency:
 * - Checks if subscription already exists before creating
 * - Checks if usage counter already exists before creating
 * - Safe to run multiple times for the same order
 */
export const createSubscriptionWorkflow = createWorkflow(
    "create-subscription",
    function (input: CreateSubscriptionWorkflowInput) {
        // Step 1: Enrich order data with plan configurations
        const orderData = enrichOrderStep({
            order_id: input.order_id,
        })

        // Step 2: Validate that reserved numbers exist and are available
        const validatedData = validateReservationStep({
            plan_items: orderData.plan_items,
        })

        // Step 3: Create subscription records
        const subscriptionData = createSubscriptionStep({
            customer_id: orderData.customer_id,
            validated_items: validatedData.validated_items,
            plan_items: orderData.plan_items,
        })

        // Step 4: Activate the phone numbers (reserved -> active)
        const activationResult = activateInventoryStep({
            validated_items: validatedData.validated_items,
        })

        // Step 5: Initialize usage counters for the billing period
        const usageResult = initializeUsageStep({
            subscriptions: subscriptionData.subscriptions,
        })

        return new WorkflowResponse({
            subscriptions: subscriptionData.subscriptions,
            activated_count: activationResult.activated_count,
            initialized_count: usageResult.initialized_count,
        })
    }
)

export default createSubscriptionWorkflow
