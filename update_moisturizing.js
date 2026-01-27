const mongoose = require("mongoose");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const ProjectSchema = new mongoose.Schema({}, { strict: false });
  const Product =
    mongoose.models.Product || mongoose.model("Product", ProjectSchema);

  const productId = "697217bcef9916911846d869";
  const product = await Product.findById(productId);

  if (!product) {
    console.error("Product not found");
    process.exit(1);
  }

  const images = product.images;

  // Update Options
  const options = [
    {
      name: "Flavor",
      values: ["Green Apple", "Pineapple"],
    },
  ];

  // Update Variants
  const variants = [
    {
      name: "Green Apple",
      sku: "SKU-APPLE-100",
      price: 225,
      stock: 100,
      attributes: { Flavor: "Green Apple" },
      imageIndex: 4,
      images: [images[4].url, images[5].url, images[6].url, images[7].url],
    },
    {
      name: "Pineapple",
      sku: "SKU-PINE-100",
      price: 225,
      stock: 100,
      attributes: { Flavor: "Pineapple" },
      imageIndex: 8,
      images: [images[8].url, images[9].url, images[10].url, images[11].url],
    },
  ];

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        name: "Moisturizing Cold Cream",
        options: options,
        variants: variants,
        "shipping.unit": "kg",
      },
    },
  );

  console.log("Product updated successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
