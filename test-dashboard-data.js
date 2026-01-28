// Quick script to check dashboard data
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/online-planet";

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get collections
    const Product = mongoose.connection.collection("products");
    const Order = mongoose.connection.collection("orders");
    const User = mongoose.connection.collection("users");

    // Find a seller user
    const seller = await User.findOne({ role: "seller" });
    if (!seller) {
      console.log("❌ No seller found in database");
      process.exit(0);
    }

    console.log(`\n👤 Seller Found:`);
    console.log(`   ID: ${seller._id}`);
    console.log(`   Name: ${seller.name}`);
    console.log(`   Email: ${seller.email}`);

    // Check products for this seller
    const products = await Product.find({ sellerId: seller._id }).toArray();
    console.log(`\n📦 Products for this seller: ${products.length}`);

    if (products.length > 0) {
      console.log(`   First product: ${products[0].name}`);
    }

    // Check orders
    const orders = await Order.find({ "items.seller": seller._id }).toArray();
    console.log(`\n🛒 Orders for this seller: ${orders.length}`);

    if (orders.length > 0) {
      console.log(`   First order: ${orders[0].orderNumber || orders[0]._id}`);
    }

    // Check all products (to see if there are any)
    const allProducts = await Product.countDocuments();
    console.log(`\n📊 Total products in database: ${allProducts}`);

    // Check all orders
    const allOrders = await Order.countDocuments();
    console.log(`📊 Total orders in database: ${allOrders}`);

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkData();
