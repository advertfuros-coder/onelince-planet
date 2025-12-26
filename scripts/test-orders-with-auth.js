// scripts/test-orders-with-auth.js
// Run this with: node scripts/test-orders-with-auth.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";
let authToken = "";

// Color output helpers
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

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Step 1: Login and get token
async function loginAndGetToken(email, password) {
  logTest("Authentication");
  try {
    log(`Logging in as: ${email}`, "yellow");

    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logSuccess("Login successful! Token obtained.");
      return true;
    } else {
      logError("Login failed: " + (response.data.message || "Unknown error"));
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Get a product ID for testing (or use a default one)
async function getTestProductId() {
  try {
    const response = await axios.get(`${API_URL}/products?limit=1`);
    if (response.data.products && response.data.products.length > 0) {
      return response.data.products[0]._id;
    }
  } catch (error) {
    // Return a fallback ID
  }
  return "6762b8e5ba75bb3e4c83e7b3"; // Fallback product ID
}

// Test 1: Create Order
async function testCreateOrder(productId) {
  logTest("Create Order");

  try {
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        items: [
          {
            productId: productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          name: "Test Customer",
          phone: "9876543210",
          email: "test@example.com",
          addressLine1: "123 Test Street",
          addressLine2: "Near Test Park",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        paymentMethod: "cod",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const orderId = response.data.order._id;
    logSuccess("Order created successfully");
    log(`Order ID: ${orderId}`, "yellow");
    log(`Order Number: ${response.data.orderNumber}`, "yellow");
    log(`Total: ₹${response.data.order.pricing.total}`, "yellow");

    return orderId;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log(error.response.data);
    }
    return null;
  }
}

// Test 2: Get Seller's Orders
async function testGetSellerOrders() {
  logTest("Get Seller Orders");

  try {
    const response = await axios.get(`${API_URL}/seller/orders`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    logSuccess(`Retrieved ${response.data.orders.length} orders`);
    if (response.data.orders.length > 0) {
      log("Latest order:", "yellow");
      const latest = response.data.orders[0];
      console.log({
        orderNumber: latest.orderNumber,
        status: latest.status,
        items: latest.items.length,
        total: latest.pricing?.total,
      });
    }

    return response.data.orders;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

// Test 3: Update Order Status
async function testUpdateStatus(orderId) {
  logTest("Update Order Status");

  if (!orderId) {
    logWarning("No order ID available. Skipping test.");
    return;
  }

  const statuses = [
    { status: "confirmed", desc: "Confirming order" },
    { status: "processing", desc: "Processing order" },
    { status: "packed", desc: "Packing complete" },
  ];

  for (const { status, desc } of statuses) {
    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        {
          status,
          description: desc,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      logSuccess(`Status updated to: ${status}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      logError(
        `Failed to update to ${status}: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
}

// Test 4: Ship Order
async function testShipOrder(orderId) {
  logTest("Ship Order");

  if (!orderId) {
    logWarning("No order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/status`,
      {
        status: "shipped",
        trackingId: "TEST123456789",
        carrier: "Test Courier",
        estimatedDelivery: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logSuccess("Order marked as shipped");
    log(`Tracking ID: ${response.data.order.shipping.trackingId}`, "yellow");
    log(`Carrier: ${response.data.order.shipping.carrier}`, "yellow");

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 5: Add Order Notes
async function testAddNotes(orderId) {
  logTest("Add Order Notes");

  if (!orderId) {
    logWarning("No order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/orders/${orderId}/notes`,
      {
        text: "Test note: Order processed successfully",
        isInternal: false,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logSuccess("Note added successfully");
    log(`Total notes: ${response.data.order.notes.length}`, "yellow");

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 6: Generate Packing Slip
async function testPackingSlip(orderId) {
  logTest("Generate Packing Slip");

  if (!orderId) {
    logWarning("No order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.get(
      `${API_URL}/orders/${orderId}/packing-slip`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    logSuccess("Packing slip generated");
    console.log("Items:", response.data.packingSlip.items.length);

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 7: Generate Invoice
async function testInvoice(orderId) {
  logTest("Generate GST Invoice");

  if (!orderId) {
    logWarning("No order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}/invoice`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    logSuccess("Invoice generated");
    log(`Invoice Number: ${response.data.invoice.invoiceNumber}`, "yellow");
    log(`Grand Total: ₹${response.data.invoice.grandTotal}`, "yellow");

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  log("\n🚀 Starting Order Management API Tests (with Auto-Login)\n", "blue");

  // Check if server is running
  try {
    await axios.get(`${API_URL.replace("/api", "")}/`);
    logSuccess("Server is running");
  } catch (error) {
    logError("Server is not running! Start it with: npm run dev");
    process.exit(1);
  }

  // Login
  const loginSuccess = await loginAndGetToken(
    "seller@onlineplanet.ae",
    "Seller@123456"
  );
  if (!loginSuccess) {
    logError("Authentication failed. Cannot proceed with tests.");
    process.exit(1);
  }

  // Get test product ID
  log("\n📦 Getting test product...", "yellow");
  const productId = await getTestProductId();
  log(`Using product ID: ${productId}`, "yellow");

  // Run tests sequentially
  let testOrderId = await testCreateOrder(productId);
  await new Promise((r) => setTimeout(r, 1000));

  await testGetSellerOrders();
  await new Promise((r) => setTimeout(r, 1000));

  if (testOrderId) {
    await testUpdateStatus(testOrderId);
    await new Promise((r) => setTimeout(r, 1000));

    await testShipOrder(testOrderId);
    await new Promise((r) => setTimeout(r, 1000));

    await testAddNotes(testOrderId);
    await new Promise((r) => setTimeout(r, 1000));

    await testPackingSlip(testOrderId);
    await new Promise((r) => setTimeout(r, 1000));

    await testInvoice(testOrderId);
  }

  log("\n✅ All tests completed!", "green");
  log("\n📱 Check your notifications:", "yellow");
  log("  • MSG91 Dashboard: https://msg91.com/in/reports", "yellow");
  log("  • Email inbox for notifications", "yellow");
  log("  • WhatsApp messages on phone", "yellow");

  log("\n🌐 View orders in UI:", "yellow");
  log("  http://localhost:3000/seller/orders", "yellow");
}

// Run tests
runAllTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
