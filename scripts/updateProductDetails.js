// scripts/updateProductDetails.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const PRODUCT_ID = "68eca1eaaf8d568c7f2acb84";

// Define schema inline
const productSchema = new mongoose.Schema({}, { strict: false });
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

async function updateProductDetails() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!");

    // Enhanced product details
    const updatedDetails = {
      description: `Experience industry-leading noise cancellation with the Sony WH-1000XM5 Wireless Headphones. Featuring two powerful processors controlling 8 microphones, these headphones deliver unprecedented noise-free listening. The newly developed 30mm driver unit with a carbon fiber composite delivers exceptional sound quality across all frequencies.

With up to 30 hours of battery life and quick charging (3 minutes = 3 hours playback), the WH-1000XM5 is perfect for long journeys. The lightweight design with soft-fit leather and stepless slider ensure all-day comfort.

Precise Voice Pickup Technology optimizes call quality with advanced audio signal processing, while multipoint connection allows seamless switching between two devices. Experience premium sound with Hi-Res Audio, LDAC, and DSEE Extreme upscaling.`,

      features: [
        "Industry-leading noise cancelling with Auto NC Optimizer",
        "Crystal clear hands-free calling with Precise Voice Pickup Technology",
        "Magnificent Sound, engineered to perfection with the new Integrated Processor V1",
        "Up to 30-hour battery life with quick charging (3 min = 3 hours)",
        "Ultra-comfortable, lightweight design with soft fit leather",
        "Multipoint connection for seamless switching between devices",
        "Speak-to-chat technology automatically pauses music",
        "Intuitive touch controls for music and calls",
        "Compatible with Alexa and Google Assistant",
        "Premium carry case included",
        "Adaptive Sound Control adjusts ambient sound settings",
        "Hi-Res Audio and LDAC support for exceptional sound quality",
        "DSEE Extreme upscales compressed digital music files",
        "360 Reality Audio for immersive listening experience",
      ],

      specifications: [
        { key: "Brand", value: "Sony" },
        { key: "Model", value: "WH-1000XM5" },
        { key: "Color", value: "Black" },
        { key: "Type", value: "Over-Ear Wireless Headphones" },
        { key: "Driver Unit", value: "30mm (Carbon Fiber Composite)" },
        { key: "Frequency Response", value: "4 Hz - 40,000 Hz" },
        {
          key: "Impedance",
          value:
            "48 Ω (1 kHz) (when connecting via headphone cable with the unit turned on)",
        },
        { key: "Bluetooth Version", value: "5.2" },
        { key: "Bluetooth Profiles", value: "A2DP, AVRCP, HFP, HSP" },
        { key: "Supported Codecs", value: "SBC, AAC, LDAC" },
        { key: "NFC", value: "Yes" },
        {
          key: "Noise Cancelling",
          value: "Yes (Industry-leading with 8 microphones)",
        },
        {
          key: "Battery Life",
          value: "Up to 30 hours (NC ON), Up to 40 hours (NC OFF)",
        },
        { key: "Quick Charging", value: "3 min charge = 3 hours playback" },
        { key: "Charging Port", value: "USB Type-C" },
        { key: "Charging Time", value: "Approx. 3.5 hours" },
        { key: "Weight", value: "Approx. 250g" },
        { key: "Microphone", value: "4-mic system with beamforming" },
        { key: "Voice Assistant", value: "Alexa, Google Assistant" },
        {
          key: "Multipoint",
          value: "Yes (Connect to 2 devices simultaneously)",
        },
        { key: "Touch Controls", value: "Yes" },
        { key: "Foldable", value: "Yes (Swivel flat design)" },
        { key: "Cable Length", value: "1.2m headphone cable included" },
        {
          key: "In The Box",
          value:
            "Headphones, Carrying case, USB cable, Audio cable, Warranty card",
        },
        { key: "Warranty", value: "1 Year Manufacturer Warranty" },
        { key: "Country of Origin", value: "Malaysia" },
      ],
    };

    const result = await Product.findByIdAndUpdate(
      PRODUCT_ID,
      { $set: updatedDetails },
      { new: true }
    );

    if (result) {
      console.log("\n✅ Product updated successfully!");
      console.log(
        `📝 Description length: ${updatedDetails.description.length} characters`
      );
      console.log(`🎯 Features added: ${updatedDetails.features.length}`);
      console.log(
        `📊 Specifications added: ${updatedDetails.specifications.length}`
      );
      console.log("\nProduct Details:");
      console.log(`- Name: ${result.name}`);
      console.log(`- Brand: ${result.brand}`);
      console.log(`- Category: ${result.category}`);
    } else {
      console.log("❌ Product not found!");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateProductDetails();
