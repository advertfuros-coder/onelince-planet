const mongoose = require("mongoose");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const ProjectSchema = new mongoose.Schema({}, { strict: false });
  const Product =
    mongoose.models.Product || mongoose.model("Product", ProjectSchema);

  const products = await Product.find({ name: /Moisturizing/i });
  console.log("Found Products:", JSON.stringify(products, null, 2));
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
