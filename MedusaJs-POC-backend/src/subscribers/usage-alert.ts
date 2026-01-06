import type { SubscriberConfig } from "@medusajs/framework"

/**
 * Usage Alert Subscriber
 * 
 * Listens for usage threshold events and sends notifications
 */
export default async function usageAlertHandler({ event, container }) {
    const logger = container.resolve("logger")

    const { subscription_id, msisdn, percentage, threshold, data_used, data_quota } = event.data

    logger.info(`[Usage Alert] ${threshold}% threshold reached for ${msisdn}`)
    logger.info(`[Usage Alert] Usage: ${data_used}MB / ${data_quota}MB (${percentage.toFixed(1)}%)`)

    // TODO: Implement actual notification sending
    // - Send SMS to customer
    // - Send email notification
    // - Push notification to mobile app
    // - Log to alert history table

    switch (threshold) {
        case 50:
            logger.info(`[Usage Alert] 📧 Sending 50% warning notification to ${msisdn}`)
            // await sendSMS(msisdn, "You've used 50% of your data. Consider upgrading your plan.")
            break

        case 80:
            logger.warn(`[Usage Alert] ⚠️  Sending 80% critical alert to ${msisdn}`)
            // await sendSMS(msisdn, "ALERT: You've used 80% of your data. Top up soon to avoid service interruption.")
            break

        case 100:
            logger.error(`[Usage Alert] 🚫 Sending 100% limit reached notification to ${msisdn}`)
            // await sendSMS(msisdn, "Your data limit has been reached. Service is suspended. Recharge now to continue.")
            break
    }

    // Log alert history (for future implementation)
    logger.info(`[Usage Alert] Alert logged for subscription ${subscription_id}`)
}

export const config: SubscriberConfig = {
    event: [
        "telecom.usage.threshold_50",
        "telecom.usage.threshold_80",
        "telecom.usage.limit_reached"
    ]
}
