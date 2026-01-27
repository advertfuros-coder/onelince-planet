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

  // Swapping Mango and Pineapple based on user feedback
  // Green Apple (Correct): 4, 5, 6, 7
  // Mango (Should be): 0, 1, 2, 3
  // Pineapple (Should be): 8, 9, 10, 11

  const mangoImages = [
    images[0].url,
    images[1].url,
    images[2].url,
    images[3].url,
  ];
  const appleImages = [
    images[4].url,
    images[5].url,
    images[6].url,
    images[7].url,
  ];
  const pineappleImages = [
    images[8].url,
    images[9].url,
    images[10].url,
    images[11].url,
  ];

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
      imageIndex: 8,
      images: pineappleImages,
    },
    {
      name: "Mango",
      sku: "SKU-MANGO-100",
      price: 225,
      stock: 100,
      attributes: { Flavor: "Mango" },
      imageIndex: 0,
      images: mangoImages,
    },
  ];

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        variants: variants,
      },
    },
  );

  console.log("Product corrected: Swapped Mango and Pineapple image mappings.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
