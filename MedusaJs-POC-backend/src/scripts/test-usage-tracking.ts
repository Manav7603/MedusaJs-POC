import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import TelecomCoreModuleService from "../modules/telecom-core/service";

export default async function testUsageTracking({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const customerModule = container.resolve(Modules.CUSTOMER);
    const telecomModule: TelecomCoreModuleService = container.resolve("telecom");

    logger.info("📊 Starting Usage Tracking Test...");
    logger.info("=".repeat(60));

    try {
        // 1. Create test customer
        logger.info("👤 Creating test customer...");
        const customer = await customerModule.createCustomers({
            email: "usage-test@telecom.com",
            first_name: "Usage",
            last_name: "Test"
        });
        logger.info(`✅ Customer created: ${customer.id}`);

        // 2. Create test MSISDN
        logger.info("📞 Creating test phone number...");
        const msisdn = await telecomModule.createMsisdnInventories({
            phone_number: "+919111111111",
            status: "active",
            tier: "gold",
            region_code: "IN-MH"
        });
        logger.info(`✅ MSISDN created: ${msisdn.id}`);

        // 3. Create test subscription
        logger.info("📋 Creating test subscription...");
        const subscription = await telecomModule.createSubscriptions({
            customer_id: customer.id,
            msisdn_id: msisdn.id,
            status: "active",
            current_period_start: new Date(),
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            billing_day: new Date().getDate()
        });
        logger.info(`✅ Subscription created: ${subscription.id}`);

        // 4. Test normal usage update
        logger.info("=".repeat(60));
        logger.info("📊 Test 1: Normal Usage Update");
        logger.info("=".repeat(60));

        const response1 = await fetch("http://localhost:9000/admin/telecom/hooks/usage-update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify([
                {
                    msisdn: "+919111111111",
                    data_mb: 1000, // 1GB
                    voice_min: 50
                }
            ])
        });

        const result1 = await response1.json();
        logger.info("Response:", JSON.stringify(result1, null, 2));

        // Verify usage counter
        const now = new Date();
        const cycleMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const counters1 = await telecomModule.listUsageCounters({
            subscription_id: subscription.id,
            cycle_month: cycleMonth
        });

        if (counters1.length > 0) {
            logger.info(`✅ Usage Counter: ${counters1[0].data_used}MB data, ${counters1[0].voice_used}min voice`);
        }

        // 5. Test threshold barring
        logger.info("=".repeat(60));
        logger.info("📊 Test 2: Exceed Quota (Should Bar)");
        logger.info("=".repeat(60));

        const response2 = await fetch("http://localhost:9000/admin/telecom/hooks/usage-update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify([
                {
                    msisdn: "+919111111111",
                    data_mb: 50000, // 50GB - exceeds 42GB quota
                    voice_min: 100
                }
            ])
        });

        const result2 = await response2.json();
        logger.info("Response:", JSON.stringify(result2, null, 2));

        // Verify subscription is barred
        const updatedSubs = await telecomModule.listSubscriptions({
            id: subscription.id
        });

        if (updatedSubs.length > 0) {
            const sub = updatedSubs[0];
            logger.info(`📋 Subscription Status: ${sub.status}`);

            if (sub.status === "barred") {
                logger.info("✅ TEST PASSED! Subscription barred due to quota exceeded");
            } else {
                logger.warn("⚠️ Subscription not barred - check threshold logic");
            }
        }

        // Verify final usage
        const counters2 = await telecomModule.listUsageCounters({
            subscription_id: subscription.id,
            cycle_month: cycleMonth
        });

        if (counters2.length > 0) {
            const quota = 42000;
            const used = counters2[0].data_used;
            const percentage = (used / quota) * 100;

            logger.info("=".repeat(60));
            logger.info("📊 Final Usage Summary:");
            logger.info(`   Data Used: ${used}MB / ${quota}MB`);
            logger.info(`   Percentage: ${percentage.toFixed(2)}%`);
            logger.info(`   Voice Used: ${counters2[0].voice_used} minutes`);
            logger.info("=".repeat(60));
        }

    } catch (error) {
        logger.error("❌ TEST FAILED!");
        logger.error(`Error: ${error.message}`);
        logger.error(`Stack: ${error.stack}`);
        throw error;
    }
}
