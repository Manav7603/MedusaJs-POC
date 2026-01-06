import { ExecArgs } from "@medusajs/framework/types"

/**
 * Test Script: Number Validation API
 * 
 * Tests the /store/telecom/validate-number/:msisdn endpoint
 */
export default async function testNumberValidation({ container }: ExecArgs) {
    const logger = container.resolve("logger")

    logger.info("🧪 Testing Number Validation API...")

    const baseUrl = "http://localhost:9000"

    try {
        // Test 1: Valid number (assuming one exists from provisioning)
        logger.info("\n📞 Test 1: Validating existing number...")

        const testMsisdn = "9876543210" // Replace with actual provisioned number

        const response1 = await fetch(
            `${baseUrl}/store/telecom/validate-number/${testMsisdn}`
        )

        const result1 = await response1.json()

        logger.info("Response:", JSON.stringify(result1, null, 2))

        if (result1.valid) {
            logger.info(`✅ Number is valid`)
            logger.info(`   Type: ${result1.type}`)
            logger.info(`   Current Plan: ${result1.current_plan}`)
            logger.info(`   Status: ${result1.status}`)
        } else {
            logger.info(`ℹ️  Number not found in system`)
        }

        // Test 2: Invalid number
        logger.info("\n📞 Test 2: Validating non-existent number...")

        const invalidMsisdn = "0000000000"

        const response2 = await fetch(
            `${baseUrl}/store/telecom/validate-number/${invalidMsisdn}`
        )

        const result2 = await response2.json()

        logger.info("Response:", JSON.stringify(result2, null, 2))

        if (!result2.valid) {
            logger.info(`✅ Correctly identified as invalid`)
        }

        // Summary
        logger.info("\n" + "=".repeat(60))
        logger.info("✅ Number Validation API Tests Complete!")
        logger.info("=".repeat(60))

    } catch (error) {
        logger.error("❌ Test failed:", error)
        throw error
    }
}
