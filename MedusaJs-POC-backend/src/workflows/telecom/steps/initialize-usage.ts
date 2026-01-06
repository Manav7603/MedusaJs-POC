import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import TelecomCoreModuleService from "../../../modules/telecom-core/service"

export type InitializeUsageInput = {
    subscriptions: Array<{
        subscription_id: string
        msisdn_id: string
    }>
}

/**
 * Step 5: Initialize Usage Counters
 * Creates usage counter records for the current billing period
 */
export const initializeUsageStep = createStep(
    "initialize-usage",
    async (input: InitializeUsageInput, { container }) => {
        const telecomService: TelecomCoreModuleService = container.resolve("telecom")

        const now = new Date()
        // Format: 'YYYY-MM'
        const cycleMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

        for (const subscription of input.subscriptions) {
            // Check if usage counter already exists (idempotency)
            const existingCounters = await telecomService.listUsageCounters({
                subscription_id: subscription.subscription_id,
                cycle_month: cycleMonth,
            })

            if (existingCounters && existingCounters.length > 0) {
                console.log(
                    `[Initialize Usage] Usage counter already exists for subscription ${subscription.subscription_id}, skipping`
                )
                continue
            }

            // Create usage counter
            await telecomService.createUsageCounters({
                subscription_id: subscription.subscription_id,
                cycle_month: cycleMonth,
                data_used: 0,
                voice_used: 0,
            })

            console.log(
                `[Initialize Usage] Created usage counter for subscription ${subscription.subscription_id} (cycle: ${cycleMonth})`
            )
        }

        return new StepResponse({
            initialized_count: input.subscriptions.length,
            cycle_month: cycleMonth,
        })
    }
)
