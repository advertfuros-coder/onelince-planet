// scripts/seedWithInsights.js
/**
 * Seed Database with Complete Insights
 * Creates seller, products, customers, orders, and reviews
 *
 * Run: node -r dotenv/config scripts/seedWithInsights.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

async function seedWithInsights() {
  console.log("🌱 Seeding database with insights...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to:", mongoose.connection.name);

    const Users = mongoose.connection.collection("users");
    const Sellers = mongoose.connection.collection("sellers");
    const Products = mongoose.connection.collection("products");
    const Orders = mongoose.connection.collection("orders");

    // 1. Get existing seller
    console.log("\n👤 Finding seller...");
    const sellerUser = await Users.findOne({ email: "seller@onlineplanet.ae" });
    if (!sellerUser) {
      console.log("❌ Seller not found. Run cleanAndSeed.js first!");
      return;
    }

    const seller = await Sellers.findOne({ userId: sellerUser._id });
    console.log("✅ Found:", seller.businessName);

    // 2. Get products
    const products = await Products.find({ sellerId: seller._id }).toArray();
    console.log(`✅ Found ${products.length} products`);

    // 3. Create customer users
    console.log("\n👥 Creating customers...");
    const customerData = [
      {
        name: "Ahmed Al Maktoum",
        email: "ahmed.maktoum@example.com",
        phone: "+971501234567",
      },
      {
        name: "Fatima Hassan",
        email: "fatima.hassan@example.com",
        phone: "+971502345678",
      },
      {
        name: "Mohammed Ali",
        email: "mohammed.ali@example.com",
        phone: "+971503456789",
      },
      {
        name: "Sara Abdullah",
        email: "sara.abdullah@example.com",
        phone: "+971504567890",
      },
      {
        name: "Omar Sheikh",
        email: "omar.sheikh@example.com",
        phone: "+971505678901",
      },
    ];

    const customers = [];
    for (const data of customerData) {
      let customer = await Users.findOne({ email: data.email });
      if (!customer) {
        const result = await Users.insertOne({
          ...data,
          password: await bcrypt.hash("Customer@123", 10),
          role: "customer",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        customer = { _id: result.insertedId, ...data };
        console.log(`  ✅ ${data.name}`);
      } else {
        console.log(`  ℹ️  ${data.name} (exists)`);
      }
      customers.push(customer);
    }

    // 4. Create orders with various statuses
    console.log("\n🛒 Creating orders...");

    const orderStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "delivered",
      "delivered",
    ];
    const paymentMethods = ["card", "cod", "upi"];
    const addresses = [
      { city: "Dubai", area: "Downtown Dubai", building: "Burj Khalifa Tower" },
      { city: "Dubai", area: "Dubai Marina", building: "Marina Heights" },
      { city: "Abu Dhabi", area: "Al Reem Island", building: "Sky Tower" },
      { city: "Sharjah", area: "Al Majaz", building: "Corniche Tower" },
      { city: "Dubai", area: "Jumeirah", building: "Palm View Residence" },
    ];

    // Create 30 orders spread over the last 6 months
    const ordersToCreate = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const daysAgo = Math.floor(Math.random() * 180); // Last 6 months
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Select 1-3 random products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();

      while (
        selectedProducts.length < numItems &&
        selectedProducts.length < products.length
      ) {
        const idx = Math.floor(Math.random() * products.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          selectedProducts.push(products[idx]);
        }
      }

      const items = selectedProducts.map((product) => {
        const quantity = Math.floor(Math.random() * 2) + 1;
        const price = product.pricing.selling;
        return {
          product: product._id,
          seller: seller._id,
          name: product.name,
          quantity,
          price,
          subtotal: price * quantity,
          status:
            orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          image: product.images[0]?.url,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const shipping = 50;
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + shipping + tax;

      const address = addresses[Math.floor(Math.random() * addresses.length)];

      ordersToCreate.push({
        customer: customer._id,
        orderNumber: `OP${Date.now()}${i}`,
        items,
        pricing: {
          subtotal,
          shipping,
          tax,
          discount: 0,
          total,
        },
        shippingAddress: {
          name: customer.name,
          phone: customer.phone,
          addressLine1: address.building,
          addressLine2: address.area,
          city: address.city,
          state: address.city,
          pincode: "00000",
          country: "UAE",
        },
        payment: {
          method:
            paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: items[0].status === "delivered" ? "paid" : "pending",
          transactionId: `TXN${Date.now()}${i}`,
        },
        status: items[0].status,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    // Insert all orders
    if (ordersToCreate.length > 0) {
      await Orders.insertMany(ordersToCreate);
      console.log(`✅ Created ${ordersToCreate.length} orders`);

      // Show summary
      const statusCounts = {};
      ordersToCreate.forEach((o) => {
        const status = o.items[0].status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log("\n📊 Order breakdown:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

      // Calculate revenue
      const deliveredOrders = ordersToCreate.filter(
        (o) => o.items[0].status === "delivered"
      );
      const totalRevenue = deliveredOrders.reduce(
        (sum, o) => sum + o.pricing.subtotal,
        0
      );
      const commission = totalRevenue * 0.05;
      const netRevenue = totalRevenue - commission;

      console.log("\n💰 Revenue:");
      console.log(`   Gross: ₹${Math.round(totalRevenue).toLocaleString()}`);
      console.log(
        `   Commission (5%): ₹${Math.round(commission).toLocaleString()}`
      );
      console.log(`   Net: ₹${Math.round(netRevenue).toLocaleString()}`);
    }

    console.log("\n🎉 Seeding with insights complete!");
    console.log("\n📊 Summary:");
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders: ${ordersToCreate.length}`);
    console.log("\n🔐 Login: seller@onlineplanet.ae / Seller@123456");
    console.log("\n✨ Dashboard now has realistic insights!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Done!\n");
  }
}

seedWithInsights();
