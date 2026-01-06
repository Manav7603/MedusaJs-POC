import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function testProvisioning({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const orderModule = container.resolve(Modules.ORDER);
    const regionService = container.resolve(Modules.REGION);
    const productModule = container.resolve(Modules.PRODUCT);
    const eventBusModule = container.resolve(Modules.EVENT_BUS);

    // Resolve telecom module
    const telecomModule = container.resolve("telecom");

    logger.info("🚀 Starting Provisioning Test...");

    // 1. Get Region & Product
    const [region] = await regionService.listRegions();

    const [product] = await productModule.listProducts(
        { handle: "hero-299" },
        { relations: ["variants"] }
    );

    if (!product) {
        logger.error("❌ Plan 'hero-299' not found. Run seed-indian-plans.ts first.");
        throw new Error("Plan 'hero-299' not found. Run seed-indian-plans.ts first.");
    }

    const variant = product.variants[0];

    logger.info("📦 Creating order directly and manually emitting event...");

    // 2. Create Order directly
    const order = await orderModule.createOrders({
        currency_code: region.currency_code,
        region_id: region.id,
        email: "test@telecom.com",
        items: [
            {
                variant_id: variant.id,
                quantity: 1,
                title: product.title,
                unit_price: 29900, // Fixed price
                metadata: {
                    allocated_number: "+919999999999",
                }
            }
        ],
        shipping_address: {
            first_name: "Test",
            last_name: "User",
            address_1: "Test Street",
            city: "Mumbai",
            country_code: "in",
            postal_code: "400001"
        }
    });

    logger.info(`🎉 Order created: ${order.id}`);
    logger.info(`📧 Order email: ${order.email}`);

    // 3. Manually emit the order.placed event (for testing)
    logger.info("🔔 Manually emitting order.placed event...");
    await eventBusModule.emit({
        name: "order.placed",
        data: { id: order.id }
    });

    logger.info("⏳ Waiting 5 seconds for Subscriber to process...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 4. VERIFY
    logger.info("🔍 Verifying Subscription in Database...");

    try {
        const subscriptions = await telecomModule.listSubscriptions({
            customer_id: order.customer_id,
        });

        if (subscriptions.length > 0) {
            const sub = subscriptions[0];
            logger.info(`✅ SUCCESS! Subscription Found: ${sub.id}`);
            logger.info(`   - Status: ${sub.status}`);
            logger.info(`   - Customer ID: ${sub.customer_id}`);
            logger.info(`   - MSISDN ID: ${sub.msisdn_id}`);
            logger.info(`   - Renewal Date: ${sub.renewal_date}`);
        } else {
            logger.error("❌ FAILURE: Order created, but no Subscription found.");
            logger.error("   Check the logs above for subscriber errors.");
        }
    } catch (e) {
        logger.error(`❌ Error checking subscriptions: ${e.message}`);

        // Fallback: Try Remote Query
        logger.warn(`Trying Remote Query as fallback...`);

        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const { data: subs } = await query.graph({
            entity: "subscription",
            fields: ["id", "status", "customer_id"],
            filters: {
                customer_id: order.customer_id
            }
        });

        if (subs.length > 0) {
            logger.info(`✅ SUCCESS (via Query)! Subscription Found: ${subs[0].id}`);
        } else {
            logger.error("❌ FAILURE: No subscription found via Query either.");
        }
    }
}