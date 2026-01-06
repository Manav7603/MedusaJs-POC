import type { SubscriberConfig } from "@medusajs/framework"
import { createSubscriptionWorkflow } from "../workflows/telecom/create-subscription"

/**
 * Telecom Order Subscriber
 * 
 * Listens for order.placed events and triggers the subscription provisioning workflow.
 * This handles the conversion of an order into active telecom subscriptions.
 * 
 * Flow:
 * 1. Order is placed (payment completed)
 * 2. This subscriber is triggered
 * 3. createSubscriptionWorkflow is executed
 * 4. Subscriptions are created, numbers activated, usage initialized
 */
export default async function handleTelecomOrder({
    event: { data },
    container,
}: {
    event: { data: { id: string } }
    container: any
}) {
    console.log("🔥 [Subscriber] RECEIVED order.placed event", JSON.stringify(data, null, 2))

    const orderId = data.id
    console.log(`🔥 [Subscriber] Extracted Order ID: ${orderId}`)

    console.log(`[Telecom Order Subscriber] Processing order ${orderId}`)

    try {
        console.log(`🔥 [Subscriber] About to execute createSubscriptionWorkflow...`)

        // Execute the create subscription workflow
        const { result } = await createSubscriptionWorkflow(container).run({
            input: {
                order_id: orderId,
            },
        })

        console.log(`🔥 [Subscriber] Workflow completed successfully!`)
        console.log(
            `[Telecom Order Subscriber] Successfully provisioned ${result.subscriptions.length} subscription(s) for order ${orderId}`
        )
        console.log(
            `[Telecom Order Subscriber] Activated ${result.activated_count} phone number(s)`
        )
        console.log(
            `[Telecom Order Subscriber] Initialized ${result.initialized_count} usage counter(s)`
        )
    } catch (error) {
        console.error(`🔥 [Subscriber] ERROR CAUGHT:`, error)
        console.error(
            `[Telecom Order Subscriber] Error provisioning order ${orderId}:`,
            error
        )
        console.error(`🔥 [Subscriber] Error stack:`, error.stack)
        // Re-throw to allow Medusa's event system to retry
        throw error
    }
}

/**
 * Subscriber Configuration
 * - event: The event to listen for (order.placed)
 * - context: Optional subscriber ID for idempotency tracking
 */
export const config: SubscriberConfig = {
    event: "order.placed",
    context: {
        subscriberId: "telecom-order-provisioning",
    },
}
