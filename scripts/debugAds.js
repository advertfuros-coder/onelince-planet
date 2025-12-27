const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    console.log("Connected to:", process.env.MONGODB_URI);

    const user = await db
      .collection("users")
      .findOne({ email: "rajesh@techstore.com" });
    if (!user) {
      console.log("User rajesh@techstore.com not found");
    } else {
      console.log("User found:", user._id.toString());
      const adsCount = await db
        .collection("advertisements")
        .countDocuments({ sellerId: user._id });
      console.log('Ads count for this user in "advertisements":', adsCount);

      const adsAll = await db.collection("advertisements").find({}).toArray();
      console.log("Total ads in system:", adsAll.length);
      if (adsAll.length > 0) {
        console.log("Example ad sellerId:", adsAll[0].sellerId.toString());
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
