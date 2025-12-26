// scripts/test-razorpay-apis.js
// Run with: node scripts/test-razorpay-apis.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";
let authToken = "";
let testOrderId = "";
let razorpayOrderId = "";
let razorpayPaymentId = "";

// Color helpers
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${"=".repeat(60)}`);
  log(`Testing: ${testName}`, "blue");
  console.log("=".repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

// Login
async function login() {
  logTest("Authentication");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "seller@onlineplanet.ae",
      password: "Seller@123456",
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logSuccess("Login successful");
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.message}`);
    return false;
  }
}

// Test 1: Create a test order first
async function createTestOrder() {
  logTest("Create Test Order for Payment");

  try {
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        items: [
          {
            productId: "69418dedc46af2717e5131e4",
            quantity: 1,
          },
        ],
        shippingAddress: {
          name: "Payment Test Customer",
          phone: "9876543210",
          email: "test@payment.com",
          addressLine1: "123 Payment Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        paymentMethod: "online", // Important: online payment
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    testOrderId = response.data.order._id;
    logSuccess("Test order created");
    log(`Order ID: ${testOrderId}`, "yellow");
    log(`Order Number: ${response.data.orderNumber}`, "yellow");
    log(`Total Amount: ₹${response.data.order.pricing.total}`, "yellow");

    return response.data.order;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test 2: Create Razorpay Order
async function testCreatePaymentOrder(order) {
  logTest("Create Razorpay Payment Order");

  if (!order) {
    logError("No order available. Skipping test.");
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/payment/create-order`,
      {
        orderId: testOrderId,
        amount: order.pricing.total,
        currency: "INR",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      razorpayOrderId = response.data.razorpayOrderId;
      logSuccess("Razorpay order created successfully");
      log(`Razorpay Order ID: ${razorpayOrderId}`, "yellow");
      log(`Amount: ₹${response.data.amount / 100}`, "yellow");
      log(`Currency: ${response.data.currency}`, "yellow");
      log(`Key ID: ${response.data.keyId}`, "yellow");
      return response.data;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log("Error details:", error.response.data);
    }
  }
}

// Test 3: Simulate Payment Verification
async function testPaymentVerification() {
  logTest("Payment Verification (Simulated)");

  if (!razorpayOrderId) {
    logError("No Razorpay order ID. Skipping test.");
    return;
  }

  log("⚠️  Note: This test simulates the payment verification flow", "yellow");
  log(
    "In production, razorpayPaymentId and signature come from Razorpay checkout",
    "yellow"
  );

  // Simulate payment details (in real scenario, these come from Razorpay)
  razorpayPaymentId = `pay_test_${Date.now()}`;
  const simulatedSignature = "simulated_signature_for_testing";

  try {
    log(
      "\nAttempting verification (will fail with invalid signature - this is expected)...",
      "yellow"
    );

    const response = await axios.post(
      `${API_URL}/payment/verify`,
      {
        orderId: testOrderId,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: simulatedSignature,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      logSuccess("Payment verified successfully");
    }
  } catch (error) {
    if (error.response?.data?.message?.includes("Invalid payment signature")) {
      log(
        "✓ Signature verification working correctly (rejected invalid signature)",
        "green"
      );
      log(
        "  In real payment flow, valid signature from Razorpay will be accepted",
        "yellow"
      );
    } else {
      logError(
        `Verification failed: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

// Test 4: Check if Razorpay keys are configured
async function testRazorpayConfiguration() {
  logTest("Razorpay Configuration Check");

  try {
    // Try to create a payment order to verify Raz orpay is configured
    const testAmount = 100;

    const response = await axios.post(
      `${API_URL}/payment/create-order`,
      {
        orderId: testOrderId || "test",
        amount: testAmount,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      logSuccess("Razorpay is configured correctly!");
      log("API Keys are set and working", "green");
    }
  } catch (error) {
    if (
      error.response?.data?.error?.includes("key_id") ||
      error.response?.data?.error?.includes("key_secret")
    ) {
      logError("Razorpay API keys not configured!");
      log("\n📝 To configure Razorpay:", "yellow");
      log("1. Sign up at: https://dashboard.razorpay.com/signup", "yellow");
      log("2. Get test keys from: Dashboard → Settings → API Keys", "yellow");
      log("3. Add to .env.local:", "yellow");
      log("   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID", "yellow");
      log("   RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET", "yellow");
      log("   RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET\n", "yellow");
    } else {
      logError(
        `Configuration error: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

// Test 5: Test Refund API (with simulated payment)
async function testRefund() {
  logTest("Refund API Test");

  if (!testOrderId) {
    logError("No order ID. Skipping test.");
    return;
  }

  log(
    "⚠️  Note: This will only work if order has a successful payment",
    "yellow"
  );

  try {
    const response = await axios.post(
      `${API_URL}/payment/refund`,
      {
        orderId: testOrderId,
        amount: 50, // Partial refund
        reason: "Test refund - API testing",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      logSuccess("Refund processed successfully");
      log(`Refund ID: ${response.data.refund.id}`, "yellow");
      log(`Amount: ₹${response.data.refund.amount}`, "yellow");
    }
  } catch (error) {
    if (error.response?.data?.message?.includes("not successful")) {
      log("✓ Refund validation working (payment not completed yet)", "green");
    } else {
      logError(
        `Refund failed: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

// Test 6: Get Refund Details
async function testGetRefund() {
  logTest("Get Refund Details");

  if (!testOrderId) {
    logError("No order ID. Skipping test.");
    return;
  }

  try {
    const response = await axios.get(
      `${API_URL}/payment/refund?orderId=${testOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      logSuccess(`Retrieved refunds`);
      log(`Refunds count: ${response.data.refunds.length}`, "yellow");
      log(`Payment status: ${response.data.paymentStatus}`, "yellow");
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  log("\n🚀 Starting Razorpay Payment Integration Tests\n", "blue");

  // Check server
  try {
    await axios.get(`${API_URL.replace("/api", "")}/`);
    logSuccess("Server is running");
  } catch (error) {
    logError("Server is not running! Start with: npm run dev");
    process.exit(1);
  }

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    logError("Authentication failed. Cannot proceed.");
    process.exit(1);
  }

  // Run tests
  await new Promise((r) => setTimeout(r, 1000));

  const order = await createTestOrder();
  await new Promise((r) => setTimeout(r, 1000));

  await testRazorpayConfiguration();
  await new Promise((r) => setTimeout(r, 1000));

  if (order) {
    await testCreatePaymentOrder(order);
    await new Promise((r) => setTimeout(r, 1000));

    await testPaymentVerification();
    await new Promise((r) => setTimeout(r, 1000));

    await testRefund();
    await new Promise((r) => setTimeout(r, 1000));

    await testGetRefund();
  }

  log("\n✅ All Razorpay API tests completed!", "green");
  log("\n📝 Next Steps:", "yellow");
  log("1. Configure Razorpay keys in .env.local", "yellow");
  log("2. Test actual payment in UI", "yellow");
  log("3. Set up webhooks for production\n", "yellow");

  log("🌐 Access Payment UI:", "blue");
  log("http://localhost:3000/checkout (after UI is built)\n", "blue");
}

// Run tests
runAllTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
