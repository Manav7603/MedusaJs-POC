import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import TelecomCoreModuleService from "../../../modules/telecom-core/service"

export type CreateSubscriptionInput = {
    customer_id: string
    validated_items: Array<{
        line_item_id: string
        msisdn_id: string
        phone_number: string
    }>
    plan_items: Array<{
        line_item_id: string
        plan_config?: {
            type: string
            contract_months: number
        }
    }>
}

export type CreateSubscriptionOutput = {
    subscriptions: Array<{
        subscription_id: string
        line_item_id: string
        msisdn_id: string
    }>
}

/**
 * Step 3: Create Subscriptions
 * Creates subscription records for each plan item
 * Includes idempotency check to prevent duplicates
 */
export const createSubscriptionStep = createStep(
    "create-subscription",
    async (input: CreateSubscriptionInput, { container }) => {
        const telecomService: TelecomCoreModuleService = container.resolve("telecom")

        const subscriptions = []
        const now = new Date()

        for (const validatedItem of input.validated_items) {
            // Find the corresponding plan config
            const planItem = input.plan_items.find(
                (p) => p.line_item_id === validatedItem.line_item_id
            )

            if (!planItem) {
                continue
            }

            // Idempotency check: Check if subscription already exists for this line item
            // We can use a query to check if a subscription with this msisdn_id already exists
            const existingSubscriptions = await telecomService.listSubscriptions({
                msisdn_id: validatedItem.msisdn_id,
            })

            if (existingSubscriptions && existingSubscriptions.length > 0) {
                console.log(
                    `[Create Subscription] Subscription already exists for MSISDN ${validatedItem.msisdn_id}, skipping`
                )
                subscriptions.push({
                    subscription_id: existingSubscriptions[0].id,
                    line_item_id: validatedItem.line_item_id,
                    msisdn_id: validatedItem.msisdn_id,
                })
                continue
            }

            // Calculate renewal date (default 30 days, or based on contract_months)
            const renewalDate = new Date(now)
            const contractMonths = planItem.plan_config?.contract_months || 1
            renewalDate.setMonth(renewalDate.getMonth() + contractMonths)

            // Get billing day (day of month when purchased)
            const billingDay = now.getDate()

            // Create subscription
            const newSubscription = await telecomService.createSubscriptions({
                customer_id: input.customer_id,
                status: "active",
                msisdn_id: validatedItem.msisdn_id,
                current_period_start: now,
                renewal_date: renewalDate,
                billing_day: billingDay,
            })

            subscriptions.push({
                subscription_id: newSubscription.id,
                line_item_id: validatedItem.line_item_id,
                msisdn_id: validatedItem.msisdn_id,
            })

            console.log(
                `[Create Subscription] Created subscription ${newSubscription.id} for phone ${validatedItem.phone_number}`
            )
        }

        return new StepResponse({
            subscriptions,
        })
    }
)
