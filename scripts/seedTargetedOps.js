const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Import schemas directly since models might not be registered in node environment easily without full next app
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: String,
  },
  { timestamps: true }
);

const SellerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    businessName: String,
    commissionRate: { type: Number, default: 5 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    images: [{ url: String }],
    pricing: { basePrice: Number },
    sku: String,
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        price: Number,
        quantity: Number,
        status: String,
      },
    ],
    pricing: { total: Number },
    status: String,
    payment: { method: String, status: String, paidAt: Date },
    returnRequest: {
      reason: String,
      description: String,
      status: String,
      requestedAt: Date,
      images: [String],
      refundAmount: Number,
    },
  },
  { timestamps: true }
);

const PayoutSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    status: { type: String, enum: ["pending", "processing", "paid", "failed"] },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    payoutDate: Date,
    transactionId: String,
    bankDetails: Object,
  },
  { timestamps: true }
);

const AdvertisementSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    campaignName: String,
    campaignType: {
      type: String,
      enum: [
        "sponsored_product",
        "featured_listing",
        "banner_ad",
        "category_spotlight",
      ],
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed", "rejected"],
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    budget: { amount: Number, spent: Number },
    bidding: { bidAmount: Number },
    schedule: { startDate: Date },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Seller = mongoose.models.Seller || mongoose.model("Seller", SellerSchema);
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Payout = mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);
const Advertisement =
  mongoose.models.Advertisement ||
  mongoose.model("Advertisement", AdvertisementSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const sellerUser = await User.findOne({ email: "rajesh@techstore.com" });
    if (!sellerUser) {
      console.log("Seller user not found. Run seedFullSellerData.js first.");
      process.exit(1);
    }

    const customerUser =
      (await User.findOne({ role: "customer" })) ||
      (await User.create({
        name: "Test Customer",
        email: "cust@test.com",
        role: "customer",
      }));

    // Ensure products exist
    await Product.deleteMany({ seller: sellerUser._id });
    const products = await Product.insertMany([
      {
        seller: sellerUser._id,
        name: "iPhone 15 Pro",
        pricing: { basePrice: 120000 },
        sku: "IP15P-001",
        images: [
          {
            url: "https://images.unsplash.com/photo-1696446701796-da61225697cc",
          },
        ],
      },
      {
        seller: sellerUser._id,
        name: "MacBook Air M3",
        pricing: { basePrice: 110000 },
        sku: "MBA-M3-001",
        images: [
          {
            url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
          },
        ],
      },
      {
        seller: sellerUser._id,
        name: "Sony WH-1000XM5",
        pricing: { basePrice: 25000 },
        sku: "SONY-XM5-001",
        images: [
          {
            url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
          },
        ],
      },
    ]);

    // Clean previous ops data for this seller
    await Order.deleteMany({ "items.seller": sellerUser._id });
    await Payout.deleteMany({ sellerId: sellerUser._id });
    await Advertisement.deleteMany({ sellerId: sellerUser._id });

    // 1. Seed Orders
    console.log("Seeding Orders...");
    const orderData = [
      {
        orderNumber: "ORD-1001",
        customer: customerUser._id,
        items: [
          {
            product: products[0]._id,
            seller: sellerUser._id,
            name: products[0].name,
            price: 120000,
            quantity: 1,
            status: "confirmed",
          },
        ],
        status: "confirmed",
        pricing: { total: 120000 },
        payment: { method: "online", status: "paid", paidAt: new Date() },
      },
      {
        orderNumber: "ORD-1002",
        customer: customerUser._id,
        items: [
          {
            product: products[1]._id,
            seller: sellerUser._id,
            name: products[1].name,
            price: 110000,
            quantity: 1,
            status: "shipped",
          },
        ],
        status: "shipped",
        pricing: { total: 110000 },
        payment: { method: "online", status: "paid", paidAt: new Date() },
      },
      {
        orderNumber: "ORD-1003",
        customer: customerUser._id,
        items: [
          {
            product: products[2]._id,
            seller: sellerUser._id,
            name: products[2].name,
            price: 25000,
            quantity: 1,
            status: "returned",
          },
        ],
        status: "returned",
        pricing: { total: 25000 },
        payment: { method: "online", status: "paid", paidAt: new Date() },
        returnRequest: {
          reason: "Defective item",
          description: "The left earbud is not working.",
          status: "requested",
          requestedAt: new Date(),
          refundAmount: 25000,
          images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b"],
        },
      },
      {
        orderNumber: "ORD-1004",
        customer: customerUser._id,
        items: [
          {
            product: products[0]._id,
            seller: sellerUser._id,
            name: products[0].name,
            price: 120000,
            quantity: 1,
            status: "processing",
          },
        ],
        status: "ready_for_pickup",
        pricing: { total: 120000 },
        payment: { method: "online", status: "paid", paidAt: new Date() },
      },
      {
        orderNumber: "ORD-1005",
        customer: customerUser._id,
        items: [
          {
            product: products[1]._id,
            seller: sellerUser._id,
            name: products[1].name,
            price: 110000,
            quantity: 2,
            status: "delivered",
          },
        ],
        status: "delivered",
        pricing: { total: 220000 },
        payment: { method: "online", status: "paid", paidAt: new Date() },
      },
    ];
    const orders = await Order.insertMany(orderData);

    // 2. Seed Payouts
    console.log("Seeding Payouts...");
    await Payout.insertMany([
      {
        sellerId: sellerUser._id,
        amount: 85000,
        status: "paid",
        orders: [orders[0]._id],
        payoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        transactionId: "TXN-998877",
        bankDetails: { bankName: "HDFC", account: "XXXX1234" },
      },
      {
        sellerId: sellerUser._id,
        amount: 112000,
        status: "pending",
        orders: [orders[1]._id],
        payoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    // 3. Seed Advertisements
    console.log("Seeding Advertisements...");
    await Advertisement.insertMany([
      {
        sellerId: sellerUser._id,
        campaignName: "New Year Electronics Bash",
        campaignType: "sponsored_product",
        status: "active",
        products: [products[0]._id, products[1]._id],
        budget: { amount: 5000, spent: 1250 },
        bidding: { bidAmount: 15 },
        schedule: { startDate: new Date() },
        metrics: { impressions: 45000, clicks: 890, revenue: 1200000 },
      },
      {
        sellerId: sellerUser._id,
        campaignName: "Audio Clearance",
        campaignType: "featured_listing",
        status: "paused",
        products: [products[2]._id],
        budget: { amount: 2000, spent: 1800 },
        bidding: { bidAmount: 10 },
        schedule: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        metrics: { impressions: 12000, clicks: 150, revenue: 35000 },
      },
    ]);

    console.log("✅ Seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
