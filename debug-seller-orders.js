// Test script to debug seller orders issue
import connectDB from "./src/lib/db/mongodb.js";
import Order from "./src/lib/db/models/Order.js";
import Product from "./src/lib/db/models/Product.js";
import mongoose from "mongoose";

async function debugSellerOrders() {
  try {
    await connectDB();
    console.log("Connected to database\n");

    // Get all orders
    const allOrders = await Order.find({}).lean();
    console.log(`Total orders in database: ${allOrders.length}\n`);

    if (allOrders.length > 0) {
      const sampleOrder = allOrders[0];
      console.log("Sample Order:");
      console.log(`- Order Number: ${sampleOrder.orderNumber}`);
      console.log(`- Status: ${sampleOrder.status}`);
      console.log(`- Items count: ${sampleOrder.items?.length || 0}`);

      if (sampleOrder.items && sampleOrder.items.length > 0) {
        const sampleItem = sampleOrder.items[0];
        console.log(`\nSample Item:`);
        console.log(`- Product ID: ${sampleItem.product}`);
        console.log(`- Seller ID: ${sampleItem.seller}`);
        console.log(`- Seller ID type: ${typeof sampleItem.seller}`);
        console.log(`- Has seller field: ${!!sampleItem.seller}`);
      }
    }

    // Get all unique seller IDs from orders
    const sellerIds = new Set();
    allOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.seller) {
          sellerIds.add(item.seller.toString());
        }
      });
    });

    console.log(`\nUnique seller IDs in orders: ${sellerIds.size}`);
    console.log("Seller IDs:", Array.from(sellerIds));

    // Get a sample product to see its structure
    const sampleProduct = await Product.findOne({}).lean();
    if (sampleProduct) {
      console.log("\nSample Product:");
      console.log(`- Product Name: ${sampleProduct.name}`);
      console.log(`- Seller ID: ${sampleProduct.sellerId}`);
      console.log(`- Seller ID type: ${typeof sampleProduct.sellerId}`);
      console.log(`- Has sellerId: ${!!sampleProduct.sellerId}`);
    }

    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debugSellerOrders();
