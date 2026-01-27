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

  // Re-identifying images based on common patterns and screenshot clues
  // Set 1 (0-3): Mango (Yellow Tub in Thumb 2 of screenshot?)
  // Set 2 (4-7): Green Apple (mzxq... tub in thumb 1)
  // Set 3 (8-11): Pineapple (Yellow/Orange Tub)

  const mangoImages = [
    images[8].url,
    images[9].url,
    images[10].url,
    images[11].url,
  ];
  const appleImages = [
    images[4].url,
    images[5].url,
    images[6].url,
    images[7].url,
  ];
  const pineappleImages = [
    images[0].url,
    images[1].url,
    images[2].url,
    images[3].url,
  ];

  // Update Options
  const options = [
    {
      name: "Flavor",
      values: ["Green Apple", "Pineapple", "Mango"],
    },
  ];

  // Update Variants with Corrected Mappings
  const variants = [
    {
      name: "Green Apple",
      sku: "SKU-APPLE-100",
      price: 225,
      stock: 100,
      attributes: { Flavor: "Green Apple" },
      imageIndex: 4,
      images: appleImages,
    },
    {
      name: "Pineapple",
      sku: "SKU-PINE-100",
      price: 225,
      stock: 100,
      attributes: { Flavor: "Pineapple" },
      imageIndex: 0,
      images: pineappleImages,
    },
    {
      name: "Mango",
      sku: "SKU-MANGO-100",
      price: 225,
      stock: 100,
      attributes: { Flavor: "Mango" },
      imageIndex: 8,
      images: mangoImages,
    },
  ];

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        name: "Moisturizing Cold Cream",
        options: options,
        variants: variants,
      },
    },
  );

  console.log("Product updated with 3 variants: Green Apple, Pineapple, Mango");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
