// scripts/test-order-apis.js
// Run this with: node scripts/test-order-apis.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";
let authToken = "";
let testOrderId = "";

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

// Test 1: Create Order
async function testCreateOrder() {
  logTest("Create Order");

  try {
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        items: [
          {
            productId: "6762b8e5ba75bb3e4c83e7b3", // Replace with actual product ID
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

    testOrderId = response.data.order._id;
    logSuccess("Order created successfully");
    log(`Order ID: ${testOrderId}`, "yellow");
    log(`Order Number: ${response.data.orderNumber}`, "yellow");
    log(`Total: ₹${response.data.order.pricing.total}`, "yellow");

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log(error.response.data);
    }
  }
}

// Test 2: Get Orders List
async function testGetOrders() {
  logTest("Get Orders List");

  try {
    const response = await axios.get(`${API_URL}/orders`, {
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
        total: latest.pricing.total,
        items: latest.items.length,
      });
    }

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 3: Update Order Status
async function testUpdateStatus() {
  logTest("Update Order Status");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  const statuses = ["confirmed", "processing", "packed"];

  for (const status of statuses) {
    try {
      const response = await axios.put(
        `${API_URL}/orders/${testOrderId}/status`,
        {
          status,
          description: `Order ${status} - automated test`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      logSuccess(`Status updated to: ${status}`);
      console.log(`Timeline entries: ${response.data.order.timeline.length}`);

      // Wait a bit between status updates
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

// Test 4: Update Status to Shipped
async function testShipOrder() {
  logTest("Ship Order");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.put(
      `${API_URL}/orders/${testOrderId}/status`,
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
async function testAddNotes() {
  logTest("Add Order Notes");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/orders/${testOrderId}/notes`,
      {
        text: "This is a test note from automated testing",
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

// Test 6: Get Order Notes
async function testGetNotes() {
  logTest("Get Order Notes");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/orders/${testOrderId}/notes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    logSuccess(`Retrieved ${response.data.notes.length} notes`);
    response.data.notes.forEach((note, idx) => {
      console.log(`Note ${idx + 1}: ${note.text} (by: ${note.addedBy})`);
    });

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 7: Edit Order
async function testEditOrder() {
  logTest("Edit Order");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.put(
      `${API_URL}/orders/${testOrderId}/edit`,
      {
        shippingAddress: {
          name: "Updated Test Customer",
          phone: "9876543210",
          addressLine1: "456 Updated Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400002",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logSuccess("Order updated successfully");
    log(
      `Updated address: ${response.data.order.shippingAddress.addressLine1}`,
      "yellow"
    );

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 8: Generate Packing Slip
async function testPackingSlip() {
  logTest("Generate Packing Slip");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.get(
      `${API_URL}/orders/${testOrderId}/packing-slip`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    logSuccess("Packing slip generated");
    console.log(response.data.packingSlip);

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 9: Generate Invoice
async function testInvoice() {
  logTest("Generate GST Invoice");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.get(
      `${API_URL}/orders/${testOrderId}/invoice`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    logSuccess("Invoice generated");
    console.log({
      invoiceNumber: response.data.invoice.invoiceNumber,
      grandTotal: response.data.invoice.grandTotal,
    });

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 10: Request Return
async function testReturnRequest() {
  logTest("Request Return");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  // First mark as delivered
  try {
    await axios.put(
      `${API_URL}/orders/${testOrderId}/status`,
      { status: "delivered" },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logSuccess("Order marked as delivered");
  } catch (error) {
    logWarning("Could not mark as delivered");
  }

  // Now request return
  try {
    const response = await axios.post(
      `${API_URL}/orders/${testOrderId}/return`,
      {
        reason: "Product not as described",
        title: "Quality Issue",
        description:
          "The product quality does not match the description on the website.",
        images: ["https://example.com/image1.jpg"],
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logSuccess("Return request submitted");
    log(`Return status: ${response.data.order.returnRequest.status}`, "yellow");

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 11: Process Return (Approve)
async function testProcessReturn() {
  logTest("Process Return Request (Approve)");

  if (!testOrderId) {
    logWarning("No test order ID available. Skipping test.");
    return;
  }

  try {
    const response = await axios.put(
      `${API_URL}/orders/${testOrderId}/return`,
      {
        action: "approved",
        pickupDate: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        refundAmount: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logSuccess("Return approved");
    log(`Return status: ${response.data.order.returnRequest.status}`, "yellow");

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 12: Cancel Order (Create new order first)
async function testCancelOrder() {
  logTest("Cancel Order");

  // Create a new order for cancellation test
  let cancelOrderId;
  try {
    const createResponse = await axios.post(
      `${API_URL}/orders`,
      {
        items: [
          {
            productId: "6762b8e5ba75bb3e4c83e7b3",
            quantity: 1,
          },
        ],
        shippingAddress: {
          name: "Cancel Test",
          phone: "9876543210",
          addressLine1: "123 Test St",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        paymentMethod: "online",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    cancelOrderId = createResponse.data.order._id;
    logSuccess(`Created order for cancellation: ${cancelOrderId}`);
  } catch (error) {
    logError("Could not create order for cancellation test");
    return;
  }

  // Now cancel it
  try {
    const response = await axios.post(
      `${API_URL}/orders/${cancelOrderId}/cancel`,
      {
        reason: "Customer changed mind - automated test",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logSuccess("Order cancelled successfully");
    log(`Status: ${response.data.order.status}`, "yellow");
    log(
      `Cancelled by: ${response.data.order.cancellation.cancelledBy}`,
      "yellow"
    );

    return response.data;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  log("\n🚀 Starting Order Management API Tests\n", "blue");

  // Check if server is running
  try {
    await axios.get(`${API_URL.replace("/api", "")}/`);
    logSuccess("Server is running");
  } catch (error) {
    logError("Server is not running! Start it with: npm run dev");
    process.exit(1);
  }

  // Get auth token (you need to replace this with actual login)
  logWarning("\n⚠️  Authentication Required");
  log(
    "Please set AUTH_TOKEN environment variable or update the script",
    "yellow"
  );
  log('Example: export AUTH_TOKEN="your_jwt_token_here"', "yellow");




  authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDE4ZGVkYzQ2YWYyNzE3ZTUxMzFkMiIsInVzZXJJZCI6IjY5NDE4ZGVkYzQ2YWYyNzE3ZTUxMzFkMiIsInJvbGUiOiJzZWxsZXIiLCJlbWFpbCI6InNlbGxlckBvbmxpbmVwbGFuZXQuYWUiLCJpYXQiOjE3NjY1MTM3MTUsImV4cCI6MTc2NzExODUxNX0.7H2L8rvw8Oizp_QQfLgdsT6s2nxtmVPb6Ofbu_d4Ax4";

  if (!authToken) {
    logError("No auth token provided. Exiting.");
    log("\nTo get a token:", "yellow");
    log("1. Login via /api/auth/login", "yellow");
    log("2. Copy the JWT token", "yellow");
    log('3. Run: export AUTH_TOKEN="your_token"', "yellow");
    log("4. Run this script again", "yellow");
    process.exit(1);
  }

  // Run tests sequentially
  await testCreateOrder();
  await new Promise((r) => setTimeout(r, 1000));

  await testGetOrders();
  await new Promise((r) => setTimeout(r, 1000));

  await testUpdateStatus();
  await new Promise((r) => setTimeout(r, 1000));

  await testShipOrder();
  await new Promise((r) => setTimeout(r, 1000));

  await testAddNotes();
  await new Promise((r) => setTimeout(r, 1000));

  await testGetNotes();
  await new Promise((r) => setTimeout(r, 1000));

  await testEditOrder();
  await new Promise((r) => setTimeout(r, 1000));

  await testPackingSlip();
  await new Promise((r) => setTimeout(r, 1000));

  await testInvoice();
  await new Promise((r) => setTimeout(r, 1000));

  await testReturnRequest();
  await new Promise((r) => setTimeout(r, 1000));

  await testProcessReturn();
  await new Promise((r) => setTimeout(r, 1000));

  await testCancelOrder();

  log("\n✅ All tests completed!", "green");
  log(
    "\nCheck your MSG91 dashboard and email inbox for notifications.",
    "yellow"
  );
}

// Run tests
runAllTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
