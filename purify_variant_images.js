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

  // Clean sets based on content analysis
  // 4-7: Perfect Green Apple set
  const appleImages = [
    images[4].url,
    images[5].url,
    images[6].url,
    images[7].url,
  ];

  // 9-11: Verified Pineapple (indices 9=Tub, 10=Ingredients, 11=Model). Index 8 was Apple (The Bug).
  const pineappleImages = [images[9].url, images[10].url, images[11].url];

  // 0, 2, 3: Verified Mango (indices 0=Tub, 2=Ingredients?, 3=Model?). Index 1 was Apple.
  const mangoImages = [images[0].url, images[2].url, images[3].url];

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
      imageIndex: 9, // Lead with the Pineapple tub
      images: pineappleImages,
    },
    {
      name: "Mango",
      sku: "SKU-MANGO-100",
      price: 225,
      stock: 100,
      attributes: { Flavor: "Mango" },
      imageIndex: 0, // Lead with the Mango tub
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

  console.log(
    "Product galleries purified. Removed stray Apple images from Pineapple and Mango sets.",
  );
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
