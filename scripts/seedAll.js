require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found");
  process.exit(1);
}

// Data generation helpers
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  console.log("🚀 Initializing Precision-Aligned Seeding Protocol [v2.1]...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection;
    console.log("✅ Neural Link Established with:", db.name);

    // 0. PURGE PROTOCOL
    const collections = [
      "users",
      "sellers",
      "products",
      "warehouses",
      "orders",
      "inventoryalerts",
      "pricingrules",
      "aiinsights",
      "competitortrackings",
      "shippingrules",
      "coupons",
      "payouts",
      "notifications",
    ];

    console.log("🗑️  Purging Cluster Data...");
    for (const colName of collections) {
      await db.collection(colName).deleteMany({});
    }

    const sellerHash = await bcrypt.hash("Seller@123456", 10);
    const customerHash = await bcrypt.hash("Customer@123456", 10);

    // 1. SEED USERS
    console.log("👤 Syncing Entities...");
    const sellerUser = await db.collection("users").insertOne({
      name: "Global Tech Hub",
      email: "seller@onlineplanet.ae",
      password: sellerHash,
      phone: "+971501234567",
      role: "seller",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const customers = [];
    const customerNames = [
      "Liam Smith",
      "Sarah Chen",
      "Omar Khalid",
      "Jessica Miller",
      "Aarav Sharma",
    ];
    for (const name of customerNames) {
      const res = await db.collection("users").insertOne({
        name,
        email: name.toLowerCase().replace(" ", ".") + "@example.com",
        password: customerHash,
        phone: "+9715" + randomInt(1111111, 9999999),
        role: "customer",
        isVerified: true,
        createdAt: randomDate(new Date(Date.now() - 90 * 86400000), new Date()),
        updatedAt: new Date(),
      });
      customers.push({ _id: res.insertedId, name });
    }

    const userId = sellerUser.insertedId;

    // 2. SEED SELLER PROFILE
    console.log("🏪 Initializing Seller Matrix...");
    const sellerProfile = await db.collection("sellers").insertOne({
      userId: userId,
      businessName: "Global Tech Hub LLC",
      businessCategory: "electronics",
      businessType: "pvt_ltd",
      gstin: "AE7766554433221",
      pan: "GTHUB1234Z",
      bankDetails: {
        accountHolderName: "Global Tech Hub LLC",
        accountNumber: "5544332211",
        bankName: "Emirates NBD",
        ifscCode: "ENBD0009988",
        accountType: "current",
      },
      pickupAddress: {
        addressLine1: "Tech Tower 1",
        addressLine2: "Dubai Internet City",
        city: "Dubai",
        state: "Dubai",
        pincode: "00000",
        country: "UAE",
      },
      storeInfo: {
        storeName: "Global Tech",
        storeDescription: "The absolute nexus of global electronic trade.",
        storeLogo: "https://placehold.co/200x200/indigo/white?text=GT",
        storeBanner:
          "https://placehold.co/1200x400/Slate/white?text=GLOBAL+TECH+HUB",
      },
      isVerified: true,
      isActive: true,
      verificationStatus: "approved",
      subscriptionPlan: "premium",
      commissionRate: 4.5,
      ratings: { average: 4.9, totalReviews: 520 },
      salesStats: { totalRevenue: 1250000, totalOrders: 3200 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const profileId = sellerProfile.insertedId;

    // 3. SEED WAREHOUSES (Uses userId based on model ref)
    console.log("🏭 Initializing Logistics Nodes...");
    const warehouseData = [
      { name: "DXB-CENTRAL", code: "WH-DXB-01", type: "main", city: "Dubai" },
      {
        name: "AUH-HUB",
        code: "WH-AUH-01",
        type: "regional",
        city: "Abu Dhabi",
      },
    ];
    const warehouseIds = [];
    for (const wh of warehouseData) {
      const res = await db.collection("warehouses").insertOne({
        sellerId: userId,
        ...wh,
        address: {
          street: "Industrial Area " + randomInt(1, 10),
          city: wh.city,
          state: wh.city,
          country: "UAE",
          pincode: "00000",
        },
        contact: {
          name: "Manager " + wh.name,
          phone: "+971501234567",
          email: wh.code.toLowerCase() + "@globaltech.ae",
        },
        capacity: { total: 5000, used: 1200, available: 3800 },
        settings: {
          autoRestock: true,
          restockThreshold: 20,
          priority: 1,
          isActive: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      warehouseIds.push(res.insertedId);
    }

    // 4. SEED PRODUCTS (Uses profileId based on API behavior)
    console.log("📦 Dispatched Product Arrays...");
    const productCategories = [
      { name: "Zenith Pro X", cat: "Smartphones", price: 3499 },
      { name: "Lumina Earbuds Gen 2", cat: "Audio", price: 599 },
      { name: "Titan Legion Laptop", cat: "Laptops", price: 8999 },
      { name: "Nexus Smartwatch", cat: "Wearables", price: 1299 },
    ];

    const products = [];
    for (const p of productCategories) {
      const res = await db.collection("products").insertOne({
        sellerId: profileId, // API expects Seller._id
        name: p.name,
        description: `State-of-the-art ${p.cat} technology.`,
        category: p.cat,
        brand: "GlobalTech",
        sku: p.name.toUpperCase().replace(/ /g, "-") + "-GT",
        pricing: {
          basePrice: p.price + 500,
          salePrice: p.price,
          costPrice: p.price * 0.7,
          discountPercentage: 10,
        },
        inventory: {
          stock: randomInt(10, 200),
          lowStockThreshold: 15,
          soldCount: randomInt(10, 100),
        },
        images: [
          {
            url: "https://placehold.co/800x800/indigo/white?text=" + p.name,
            alt: p.name,
            isPrimary: true,
          },
        ],
        isActive: true,
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      products.push({ _id: res.insertedId, name: p.name, price: p.price });
    }

    // 5. SEED ORDERS (Uses userId based on API behavior)
    console.log("🧾 Generating Synthetic Order Stream...");
    const orderStatuses = ["delivered", "shipped", "processing"];
    for (let i = 0; i < 40; i++) {
      const customer = sample(customers);
      const prod = sample(products);
      const status = sample(orderStatuses);
      const orderDate = randomDate(
        new Date(Date.now() - 30 * 86400000),
        new Date()
      );

      await db.collection("orders").insertOne({
        orderNumber: `ORD-${2024000 + i}`,
        customer: customer._id,
        items: [
          {
            product: prod._id,
            seller: userId, // API expects User._id
            name: prod.name,
            price: prod.price,
            quantity: 1,
            status: status,
          },
        ],
        pricing: {
          subtotal: prod.price,
          tax: prod.price * 0.05,
          shipping: 0,
          total: prod.price * 1.05,
        },
        status: status,
        payment: { method: "online", status: "paid", paidAt: orderDate },
        createdAt: orderDate,
        updatedAt: orderDate,
        timeline: [
          { status: "confirmed", timestamp: orderDate },
          { status: status, timestamp: orderDate },
        ],
      });
    }

    // 6. SEED RETURN REQUESTS (Uses userId in Order.items.seller)
    console.log("🔄 Initializing Return Logistics...");
    const returnProds = products.slice(0, 2);
    for (const prod of returnProds) {
      await db.collection("orders").insertOne({
        orderNumber: `RET-ORD-${randomInt(1000, 9999)}`,
        customer: customers[0]._id,
        items: [
          {
            product: prod._id,
            seller: userId,
            name: prod.name,
            price: prod.price,
            quantity: 1,
            status: "returned",
          },
        ],
        pricing: {
          subtotal: prod.price,
          tax: 0,
          shipping: 0,
          total: prod.price,
        },
        status: "returned",
        payment: { method: "online", status: "paid" },
        returnRequest: {
          reason: "Defective holographic relay",
          title: "Hardware Signal Failure",
          status: sample(["requested", "received"]),
          requestedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 7. SEED COUPONS (Uses userId)
    console.log("🎫 Printing Vouchers...");
    await db.collection("coupons").insertOne({
      code: "WELCOME50",
      type: "fixed",
      value: 50,
      createdBy: userId,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 86400000 * 30),
      isActive: true,
      usageLimit: { total: 100, perUser: 1 },
      createdAt: new Date(),
    });

    // 8. SEED PAYOUTS (Uses profileId)
    console.log("� Closing Financial Cycles...");
    await db.collection("payouts").insertOne({
      sellerId: profileId,
      amount: 5000,
      status: "completed",
      bankDetails: { bankName: "Emirates NBD", accountNumber: "XXXX2211" },
      createdAt: new Date(Date.now() - 86400000),
      completedAt: new Date(),
    });

    // 9. SEED MISC (Mostly userId based on model ref)
    console.log("🧠 Syncing Additional Vectors...");
    await db
      .collection("inventoryalerts")
      .insertOne({
        sellerId: userId,
        productId: products[0]._id,
        alertType: "low_stock",
        currentStock: 5,
        threshold: 15,
        priority: "high",
        status: "active",
        createdAt: new Date(),
      });
    await db
      .collection("pricingrules")
      .insertOne({
        sellerId: userId,
        name: "Flash Sale",
        type: "scheduled",
        status: "active",
        priceAdjustment: { type: "percentage", value: -20 },
        createdAt: new Date(),
      });
    await db
      .collection("aiinsights")
      .insertOne({
        sellerId: userId,
        type: "revenue_forecast",
        title: "Monthly Pulse",
        status: "generated",
        recommendations: [{ action: "Restock Zenith", priority: "high" }],
        createdAt: new Date(),
      });
    await db
      .collection("competitortrackings")
      .insertOne({
        sellerId: userId,
        productId: products[0]._id,
        currentPosition: { myPrice: 3499, lowestCompetitorPrice: 3390 },
        createdAt: new Date(),
      });
    await db
      .collection("shippingrules")
      .insertOne({
        sellerId: userId,
        name: "Dubai Local",
        type: "flat",
        pricing: { baseRate: 20 },
        createdAt: new Date(),
      });

    // Batch Notifications
    await db.collection("notifications").insertMany([
      {
        userId: userId,
        type: "LOW_STOCK",
        category: "inventory",
        priority: "high",
        title: "Inventory Alert: Zenith Pro X",
        message:
          "Stock has fallen below threshold in DXB-CENTRAL. Current units: 5.",
        actionUrl: "/seller/inventory-alerts",
        actionText: "Manage Stock",
        read: false,
        createdAt: new Date(),
      },
      {
        userId: userId,
        type: "NEW_ORDER",
        category: "sales",
        priority: "medium",
        title: "New Transmission Received",
        message:
          "Incoming order ORD-2024145 detected from Premium Customer Segment.",
        actionUrl: "/seller/orders",
        actionText: "Process Order",
        read: false,
        createdAt: new Date(),
      },
      {
        userId: userId,
        type: "COMPETITOR_PRICE_ALERT",
        category: "marketing",
        priority: "urgent",
        title: "Price Signal Detected",
        message:
          "Amazon.ae has dropped Lumina Earbuds price by 12%. Response suggested.",
        actionUrl: "/seller/competitors",
        actionText: "Analyze Price",
        read: false,
        createdAt: new Date(),
      },
    ]);

    console.log("\n✨ PRECISION SYNCHRONIZATION COMPLETE!");
    console.log(`\n🔐 SELLER ACCESS: [seller@onlineplanet.ae / Seller@123456]`);
  } catch (err) {
    console.error("\n❌ CRITICAL SYSTEM FAILURE:", err.message);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
