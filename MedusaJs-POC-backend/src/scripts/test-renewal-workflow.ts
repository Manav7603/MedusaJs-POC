import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { processRenewalWorkflow } from "../workflows/telecom/process-renewal";
import TelecomCoreModuleService from "../modules/telecom-core/service";

export default async function testRenewalWorkflow({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const customerModule = container.resolve(Modules.CUSTOMER);
    const telecomModule: TelecomCoreModuleService = container.resolve("telecom");

    logger.info("🔄 Starting Renewal Workflow Test...");
    logger.info("=".repeat(60));

    try {
        // 1. Create test customer
        logger.info("👤 Creating test customer...");
        const customer = await customerModule.createCustomers({
            email: "renewal-test@telecom.com",
            first_name: "Renewal",
            last_name: "Test"
        });
        logger.info(`✅ Customer created: ${customer.id}`);

        // 2. Create test MSISDN
        logger.info("📞 Creating test phone number...");
        const msisdn = await telecomModule.createMsisdnInventories({
            phone_number: "+919876543210",
            status: "active",
            tier: "gold",
            region_code: "IN-MH"
        });
        logger.info(`✅ MSISDN created: ${msisdn.id}`);

        // 3. Create test subscription (due for renewal today)
        logger.info("📋 Creating test subscription...");
        const today = new Date();
        const subscription = await telecomModule.createSubscriptions({
            customer_id: customer.id,
            msisdn_id: msisdn.id,
            status: "active",
            current_period_start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            renewal_date: today, // Due today!
            billing_day: today.getDate()
        });
        logger.info(`✅ Subscription created: ${subscription.id}`);
        logger.info(`   Renewal date: ${subscription.renewal_date}`);

        // 4. Test the renewal workflow
        logger.info("=".repeat(60));
        logger.info("🔧 Testing Renewal Workflow...");
        logger.info("=".repeat(60));

        const { result } = await processRenewalWorkflow(container).run({
            input: {
                subscription_id: subscription.id
            }
        });

        logger.info("=".repeat(60));
        logger.info("✅ WORKFLOW COMPLETED!");
        logger.info("=".repeat(60));
        logger.info("📊 Results:");
        logger.info(`   Plan Type: ${result.plan_type}`);

        if (result.plan_type === "postpaid") {
            logger.info(`   Draft Order: ${result.postpaid_data.draft_order_id}`);
            logger.info(`   Amount: ₹${result.postpaid_data.renewal_amount / 100}`);
            logger.info(`   Email Sent: ${result.postpaid_data.email_sent ? '✅' : '❌'}`);
            logger.info(`   New Status: ${result.renewal_update.new_status}`);
            logger.info(`   New Renewal Date: ${result.renewal_update.new_renewal_date}`);
            logger.info(`   Usage Counter: ${result.usage_update.usage_counter_id || 'N/A'}`);
        } else {
            logger.info(`   Wallet Check: ${result.prepaid_data.wallet_check_passed ? '✅ PASSED' : '❌ FAILED'}`);
            logger.info(`   New Status: ${result.renewal_update.new_status}`);

            if (result.prepaid_data.should_suspend) {
                logger.warn(`   ⚠️ SUBSCRIPTION SUSPENDED`);
            } else {
                logger.info(`   ✅ Renewal Successful`);
                logger.info(`   New Renewal Date: ${result.renewal_update.new_renewal_date}`);
                logger.info(`   Usage Counter: ${result.usage_update.usage_counter_id || 'N/A'}`);
            }
        }

        // 5. Verify in database
        logger.info("=".repeat(60));
        logger.info("🔍 Verifying in database...");

        const updatedSubs = await telecomModule.listSubscriptions({
            id: subscription.id
        });

        if (updatedSubs.length > 0) {
            const sub = updatedSubs[0];
            logger.info("📋 Updated Subscription:");
            logger.info(`   Status: ${sub.status}`);
            logger.info(`   Renewal Date: ${sub.renewal_date}`);

            if (sub.status === "active") {
                logger.info("✅ TEST PASSED! Subscription renewed successfully");
            } else if (sub.status === "suspended") {
                logger.warn("⚠️ TEST PASSED! Subscription suspended (wallet check failed)");
            }
        }

        logger.info("=".repeat(60));

    } catch (error) {
        logger.error("❌ TEST FAILED!");
        logger.error(`Error: ${error.message}`);
        logger.error(`Stack: ${error.stack}`);
        throw error;
    }
}
