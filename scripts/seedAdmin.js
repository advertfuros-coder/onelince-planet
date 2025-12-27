// scripts/seedAdmin.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  console.log("🌱 Seeding Admin Account...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to:", mongoose.connection.name);

    const email = "admin@onlineplanet.ae";
    const password = "Admin@123456";
    const hashedPassword = await bcrypt.hash(password, 10);

    let admin = await User.findOne({ email });

    if (admin) {
      console.log("ℹ️ Admin user already exists. Updating password...");
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isVerified = true;
      await admin.save();
      console.log("✅ Admin password updated.");
    } else {
      admin = await User.create({
        name: "Admin",
        email,
        password: hashedPassword,
        phone: "+971000000000",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Admin user created:", admin.email);
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\n🔐 Admin Login:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Done!\n");
  }
}

seedAdmin();
