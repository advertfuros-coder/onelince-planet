// scripts/checkData.js
/**
 * Check Database Data
 * Verify seller and products exist
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const Users = mongoose.connection.collection("users");
    const Sellers = mongoose.connection.collection("sellers");
    const Products = mongoose.connection.collection("products");

    // Find seller user
    const sellerUser = await Users.findOne({ email: "seller@onlineplanet.ae" });
    console.log("👤 Seller User:");
    console.log("   ID:", sellerUser?._id);
    console.log("   Email:", sellerUser?.email);
    console.log("   Role:", sellerUser?.role);

    // Find seller profile
    const seller = await Sellers.findOne({ userId: sellerUser?._id });
    console.log("\n🏪 Seller Profile:");
    console.log("   ID:", seller?._id);
    console.log("   Business:", seller?.businessName);
    console.log("   User ID:", seller?.userId);

    // Find products
    const products = await Products.find({ sellerId: seller?._id }).toArray();
    console.log("\n📦 Products:");
    console.log("   Count:", products.length);

    if (products.length > 0) {
      console.log("\n   Products found:");
      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      Seller ID: ${p.sellerId}`);
        console.log(`      Active: ${p.isActive}`);
      });
    } else {
      console.log("   ❌ No products found!");
      console.log("\n   Checking all products in database:");
      const allProducts = await Products.find({}).toArray();
      console.log("   Total products:", allProducts.length);
      if (allProducts.length > 0) {
        allProducts.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} (sellerId: ${p.sellerId})`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

check();
