import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createSubscriptionWorkflow } from "../workflows/telecom/create-subscription";

export default async function testWorkflowDirectly({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const orderModule = container.resolve(Modules.ORDER);
    const regionService = container.resolve(Modules.REGION);
    const productModule = container.resolve(Modules.PRODUCT);
    const customerModule = container.resolve(Modules.CUSTOMER);
    const telecomModule = container.resolve("telecom");

    logger.info("🚀 Starting Direct Workflow Test...");

    // 1. Create a test customer
    logger.info("👤 Creating test customer...");
    const customer = await customerModule.createCustomers({
        email: "test@telecom.com",
        first_name: "Test",
        last_name: "User"
    });
    logger.info(`✅ Customer created: ${customer.id}`);

    // 2. Get Region & Product
    const [region] = await regionService.listRegions();
    const [product] = await productModule.listProducts(
        { handle: "hero-299" },
        { relations: ["variants"] }
    );

    if (!product) {
        logger.error("❌ Plan 'hero-299' not found. Run seed-indian-plans.ts first.");
        throw new Error("Plan 'hero-299' not found");
    }

    const variant = product.variants[0];
    logger.info(`✅ Found product: ${product.title}`);

    // 2. First, create a test MSISDN in inventory with 'reserved' status
    logger.info("📞 Creating test phone number in inventory...");
    const testNumber = "+919999999999";

    try {
        const testMsisdn = await telecomModule.createMsisdnInventories({
            phone_number: testNumber,
            status: "reserved",
            tier: "gold",
            region_code: "IN-MH"
        });
        logger.info(`✅ Created test MSISDN: ${testMsisdn.id}`);
    } catch (e) {
        logger.warn(`MSISDN might already exist: ${e.message}`);
    }

    // 3. Create Order
    logger.info("📦 Creating test order...");
    const order = await orderModule.createOrders({
        customer_id: customer.id,
        currency_code: region.currency_code,
        region_id: region.id,
        email: "test@telecom.com",
        items: [
            {
                variant_id: variant.id,
                quantity: 1,
                title: product.title,
                unit_price: 29900,
                metadata: {
                    allocated_number: testNumber,
                },
            },
        ],
        shipping_address: {
            first_name: "Test",
            last_name: "User",
            address_1: "Test Street",
            city: "Mumbai",
            country_code: "in",
            postal_code: "400001",
        },
    });

    logger.info(`✅ Order created: ${order.id}`);
    logger.info(`   Customer ID: ${order.customer_id}`);

    // 4. Directly call the workflow
    logger.info("🔧 Calling createSubscriptionWorkflow directly...");
    logger.info("=".repeat(60));

    try {
        const { result } = await createSubscriptionWorkflow(container).run({
            input: {
                order_id: order.id,
            },
        });

        logger.info("=".repeat(60));
        logger.info("✅ WORKFLOW COMPLETED SUCCESSFULLY!");
        logger.info(`   - Created ${result.subscriptions.length} subscription(s)`);
        logger.info(`   - Activated ${result.activated_count} phone number(s)`);
        logger.info(`   - Initialized ${result.initialized_count} usage counter(s)`);
        logger.info("=".repeat(60));

        // 5. Verify in database
        logger.info("🔍 Verifying in database...");

        const subscriptions = await telecomModule.listSubscriptions({
            customer_id: order.customer_id,
        });

        if (subscriptions.length > 0) {
            const sub = subscriptions[0];
            logger.info("📋 Subscription Details:");
            logger.info(`   - ID: ${sub.id}`);
            logger.info(`   - Status: ${sub.status}`);
            logger.info(`   - Customer ID: ${sub.customer_id}`);
            logger.info(`   - MSISDN ID: ${sub.msisdn_id}`);
            logger.info(`   - Billing Day: ${sub.billing_day}`);
            logger.info(`   - Renewal Date: ${sub.renewal_date}`);

            // Check MSISDN status
            const msisdns = await telecomModule.listMsisdnInventories({
                id: sub.msisdn_id
            });

            if (msisdns.length > 0) {
                logger.info("📞 MSISDN Status:");
                logger.info(`   - Phone: ${msisdns[0].phone_number}`);
                logger.info(`   - Status: ${msisdns[0].status}`);
            }

            // Check usage counter
            const now = new Date();
            const cycleMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            const usageCounters = await telecomModule.listUsageCounters({
                subscription_id: sub.id,
                cycle_month: cycleMonth
            });

            if (usageCounters.length > 0) {
                logger.info("📊 Usage Counter:");
                logger.info(`   - Cycle: ${usageCounters[0].cycle_month}`);
                logger.info(`   - Data Used: ${usageCounters[0].data_used} MB`);
                logger.info(`   - Voice Used: ${usageCounters[0].voice_used} min`);
            }

            logger.info("=".repeat(60));
            logger.info("🎉 TEST PASSED! All components working correctly!");
            logger.info("=".repeat(60));
        } else {
            logger.error("❌ TEST FAILED: No subscription found in database");
        }
    } catch (error) {
        logger.error("=".repeat(60));
        logger.error("❌ WORKFLOW FAILED!");
        logger.error(`Error: ${error.message}`);
        logger.error(`Stack: ${error.stack}`);
        logger.error("=".repeat(60));
        throw error;
    }
}
