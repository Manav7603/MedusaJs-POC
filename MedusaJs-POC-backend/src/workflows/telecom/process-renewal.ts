import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { fetchSubscriptionDetailsStep } from "./steps/fetch-subscription-details"
import { processPostpaidRenewalStep } from "./steps/process-postpaid-renewal"
import { processPrepaidRenewalStep } from "./steps/process-prepaid-renewal"
import { extendRenewalDateStep } from "./steps/extend-renewal-date"
import { resetUsageCounterStep } from "./steps/reset-usage-counter"

export type ProcessRenewalInput = {
    subscription_id: string
}

/**
 * Process Renewal Workflow
 * 
 * Handles subscription renewals for both postpaid and prepaid plans:
 * 
 * Postpaid Flow:
 * 1. Fetch subscription details
 * 2. Create draft order for renewal
 * 3. Send invoice email (mocked)
 * 4. Extend renewal date
 * 5. Reset usage counter
 * 
 * Prepaid Flow:
 * 1. Fetch subscription details
 * 2. Check wallet balance (mocked)
 * 3. If success: Extend renewal date + Reset usage
 * 4. If failure: Suspend subscription
 */
export const processRenewalWorkflow = createWorkflow(
    "process-renewal",
    (input: ProcessRenewalInput) => {
        // Step 1: Fetch subscription details
        const { subscription, msisdn, plan_config } = fetchSubscriptionDetailsStep({
            subscription_id: input.subscription_id
        })

        // Check plan type
        const planType = transform({ plan_config }, ({ plan_config }) => plan_config.type)

        // For postpaid: create draft order
        const postpaidData = processPostpaidRenewalStep({
            subscription,
            msisdn,
            plan_config
        })

        // For prepaid: check wallet
        const prepaidData = processPrepaidRenewalStep({
            subscription,
            msisdn,
            plan_config
        })

        // Determine if should suspend (only for prepaid with failed wallet check)
        const shouldSuspend = transform(
            { plan_config, prepaidData },
            ({ plan_config, prepaidData }) => {
                return plan_config.type === "prepaid" && prepaidData.should_suspend
            }
        )

        // Extend renewal date (or suspend)
        const renewalUpdate = extendRenewalDateStep({
            subscription,
            plan_config,
            should_suspend: shouldSuspend
        })

        // Reset usage counter (skip if suspended)
        const usageUpdate = resetUsageCounterStep({
            subscription,
            should_skip: shouldSuspend
        })

        return new WorkflowResponse({
            subscription_id: input.subscription_id,
            plan_type: planType,
            postpaid_data: postpaidData,
            prepaid_data: prepaidData,
            renewal_update: renewalUpdate,
            usage_update: usageUpdate
        })
    }
)
