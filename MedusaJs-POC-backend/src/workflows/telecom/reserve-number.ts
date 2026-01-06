import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { findAvailableNumberStep } from "./steps/find-available-number"
import { lockNumberStep } from "./steps/lock-number"

export type ReserveNumberWorkflowInput = {
    region_code?: string
    tier?: string
    specific_number?: string
}

export type ReserveNumberWorkflowOutput = {
    id: string
    phone_number: string
}

/**
 * Reserve Number Workflow
 * 
 * This workflow handles the "Select a Number" flow for users.
 * It finds an available phone number and locks it so no one else can take it
 * while the user completes checkout.
 * 
 * Steps:
 * 1. Find an available number based on filters (region, tier, or specific number)
 * 2. Lock the number by setting status to 'reserved'
 * 
 * If the workflow fails, the compensation function automatically rolls back
 * the number status to 'available'.
 */
export const reserveNumberWorkflow = createWorkflow(
    "reserve-number",
    function (input: ReserveNumberWorkflowInput) {
        // Step 1: Find an available number
        const availableNumber = findAvailableNumberStep(input)

        // Step 2: Lock/reserve the number
        const reservedNumber = lockNumberStep(availableNumber)

        return new WorkflowResponse({
            id: reservedNumber.id,
            phone_number: reservedNumber.phone_number,
        })
    }
)

export default reserveNumberWorkflow
