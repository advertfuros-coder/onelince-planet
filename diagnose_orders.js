const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");

    // The incorrect Seller ID
    const oldSellerIdString = "6957e7eadc285d04893c3742";
    const ObjectId = require("mongoose").Types.ObjectId;

    // Check for orders with this seller in items.seller
    // items is an array, we can query items.seller

    // Try matching string or ObjectId just in case
    const query = {
      $or: [
        { "items.seller": new ObjectId(oldSellerIdString) },
        { "items.seller": oldSellerIdString },
      ],
    };

    const orders = await ordersCollection.find(query).toArray();
    console.log(
      `Found ${orders.length} orders with the incorrect seller ID ${oldSellerIdString}`,
    );

    if (orders.length > 0) {
      orders.forEach((o) => {
        console.log(`Order: ${o.orderNumber}, ID: ${o._id}`);
        o.items.forEach((item) => {
          console.log(` - Item: ${item.name}, Seller: ${item.seller}`);
        });
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
