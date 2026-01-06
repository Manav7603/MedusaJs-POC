import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type ProcessPostpaidRenewalInput = {
    subscription: any
    msisdn: any
    plan_config: any
}

export type ProcessPostpaidRenewalOutput = {
    draft_order_id: string
    renewal_amount: number
    email_sent: boolean
}

/**
 * Step 2a: Process Postpaid Renewal
 * Creates draft order and sends invoice email
 */
export const processPostpaidRenewalStep = createStep(
    "process-postpaid-renewal",
    async (input: ProcessPostpaidRenewalInput, { container }) => {
        const orderModule = container.resolve(Modules.ORDER)

        console.log(`[Postpaid Renewal] Processing postpaid renewal for subscription ${input.subscription.id}`)

        // Calculate renewal amount (mock - in production this would be based on plan price)
        const renewal_amount = 29900 // ₹299

        // Create draft order for renewal
        const draftOrder = await orderModule.createOrders({
            customer_id: input.subscription.customer_id,
            currency_code: "inr",
            email: `customer-${input.subscription.customer_id}@telecom.com`,
            status: "pending",
            items: [
                {
                    title: `Renewal - ${input.msisdn.phone_number}`,
                    quantity: 1,
                    unit_price: renewal_amount,
                    metadata: {
                        renewal_for_subscription: input.subscription.id,
                        renewal_date: new Date().toISOString()
                    }
                }
            ]
        })

        console.log(`[Postpaid Renewal] Created draft order: ${draftOrder.id}`)

        // Mock email notification
        console.log(`[Postpaid Renewal] 📧 MOCK EMAIL SENT`)
        console.log(`   To: customer-${input.subscription.customer_id}@telecom.com`)
        console.log(`   Subject: Invoice for ${input.msisdn.phone_number} Renewal`)
        console.log(`   Amount: ₹${renewal_amount / 100}`)
        console.log(`   Order ID: ${draftOrder.id}`)

        return new StepResponse({
            draft_order_id: draftOrder.id,
            renewal_amount,
            email_sent: true
        })
    }
)
