const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Emulate the model import
const AdvertisementSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    campaignName: String,
    status: String,
  },
  { timestamps: true }
);

// Mongoose pluralizes "Advertisement" to "advertisements"
const Advertisement =
  mongoose.models.Advertisement ||
  mongoose.model("Advertisement", AdvertisementSchema, "advertisements");

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const ads = await Advertisement.find({});
    console.log("Found ads count:", ads.length);
    ads.forEach((ad) =>
      console.log(`- ${ad.campaignName} (Seller: ${ad.sellerId})`)
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
