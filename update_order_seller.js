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

    const oldSellerIdString = "6957e7eadc285d04893c3742";
    const newSellerIdString = "6957e7eadc285d04893c3744";
    const ObjectId = require("mongoose").Types.ObjectId;

    const oldSellerId = new ObjectId(oldSellerIdString);
    const newSellerId = new ObjectId(newSellerIdString);

    const query = {
      "items.seller": oldSellerId,
    };

    const orders = await ordersCollection.find(query).toArray();
    console.log(`Found ${orders.length} orders to update.`);

    let updatedCount = 0;
    for (const order of orders) {
      let modified = false;
      const newItems = order.items.map((item) => {
        if (item.seller && item.seller.toString() === oldSellerIdString) {
          item.seller = newSellerId;
          modified = true;
        }
        return item;
      });

      if (modified) {
        await ordersCollection.updateOne(
          { _id: order._id },
          { $set: { items: newItems } },
        );
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} orders.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
